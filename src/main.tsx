import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
type Levenpath = {i:number, j:number, type?:string}[];
const presets = "elephant|relevant,Saturday|Sunday,Google|Facebook".split(",").map(x => x.split("|"));
function levenshtein(str1: string, str2: string) {
	str1 = str1.toLowerCase(); str2 = str2.toLowerCase();
	let m: number[][] = [], paths: [number, number][][] = [],
		l1 = str1.length, l2 = str2.length;
	for (let i = 0; i <= l1; i++) {
		m[i] = [i];
		paths[i] = [[i - 1, 0]];
	}
	for (let j = 0; j <= l2; j++) {
		m[0][j] = j;
		paths[0][j] = [0, j - 1];
	}
	for (let i = 1; i <= l1; i++)
		for (let j = 1; j <= l2; j++) {
			if (str1.charAt(i - 1) == str2.charAt(j - 1)) {
				m[i][j] = m[i - 1][j - 1];
				paths[i][j] = [i - 1, j - 1];
			} else {
				let min = Math.min(m[i - 1][j], m[i][j - 1], m[i - 1][j - 1]);
				m[i][j] = min + 1;
				if (m[i - 1][j] === min)
					paths[i][j] = [i - 1, j];
				else if (m[i][j - 1] === min)
					paths[i][j] = [i, j - 1];
				else if (m[i - 1][j - 1] === min)
					paths[i][j] = [i - 1, j - 1];
			}
		}

	// one of many possible paths
	let levenpath: Levenpath = [];
	let j = l2;
	for (let i = l1; i >= 0 && j >= 0;)
		for (j = l2; i >= 0 && j >= 0;) {
			levenpath.push({i, j});
			let t = i;
			i = paths[i][j][0];
			j = paths[t][j][1];
		}
	levenpath = levenpath.reverse();
	for (let i = 0; i < levenpath.length; i++) {
		const last = levenpath[i - 1], cur = levenpath[i];
		if (i !== 0) {
			if (cur.i === last.i + 1 && cur.j === last.j + 1 && m[cur.i][cur.j] !== m[last.i][last.j]) cur.type = 'replace';
			else if (cur.i === last.i && cur.j === last.j + 1) cur.type = 'insert';
			else if (cur.i === last.i + 1 && cur.j === last.j) cur.type = 'delete';
		}
	}
	return { matrix: m, levenpath: levenpath };
}

function loop<T>(i: number, callback: (i:number) => T): T[] {
	return Array.apply(null, new Array(i)).map((e:any, i:number) => callback(i));
}

const initialState = {str1:"", str2:"", highlight: {i:-1, j:-1}, showTrivial: true};
type GuiState = typeof initialState;
class Gui extends React.Component<{}, GuiState> {
	matrix: number[][];
	levenpath: Levenpath;
	constructor() {
		super();
		this.state = initialState;
	}
	onClick() {
		this.setState({
			str1: (this.refs["str1"] as HTMLInputElement).value.trim(),
			str2: (this.refs["str2"] as HTMLInputElement).value.trim()});
	}
	render() {
		const {str1, str2, highlight} = this.state;
		const header = 
			<div className="page-header">
				<h1>Levenshtein Distance Calculator</h1>
				<p>How many insertions, deletions, and substitutions does it take to turn <input ref="str1" className="str" defaultValue={str1} placeholder="word 1" tabIndex={1} /> into <input ref="str2" className="str" defaultValue={str2} placeholder="word 2" tabIndex={2} />?</p>
				<p>Try {presets.map((p,i) => 
					<a key={i} onClick={() => this.setState({str1:p[0], str2:p[1]})}><i>{p[0]}</i> and <i>{p[1]}</i>{i==presets.length-1?".":", "}</a>
				)}</p>
				<button type="button" className="btn btn-primary" onClick={this.onClick.bind(this)} tabIndex={3}>Calculate Levenshtein distance</button>
			</div>;
		const matrix = this.matrix, levenpath = this.levenpath;
		let result = <div/>;
		if(matrix) {
			let l = levenpath;
			if(this.state.showTrivial) l = l.slice(1);
			else l = l.filter(x => !!x.type);
			const steps = l.map((cur,i) => {
				let className = highlight.i == cur.i && highlight.j == cur.j ? "highlighted":"";
				const fragment = (() => {
					switch(cur.type) {
						case 'replace': return <span><em>{str1.charAt(cur.i - 1)}</em> with <em>{str2.charAt(cur.j - 1)}</em></span>;
						case 'insert': return <em>{str2.charAt(cur.j - 1)}</em>;
						case 'delete': return <em>{str1.charAt(cur.i - 1)}</em>;
						default:
							className += " grayed"; 
							return <span className="grayed">don't change <em>{str1.charAt(cur.i-1)}</em></span>
					}
				})();
				return <li className={className}
					onMouseEnter={() => this.setState({highlight:{i:cur.i,j:cur.j}})}
					onMouseLeave={() => this.setState({highlight:{i:-1,j:-1}})} key={cur.i+","+cur.j}
				><i>{str2.substr(0, cur.j-1)}<b>{str2[cur.j - 1]}</b>{str1.substr(cur.i)}</i>: {cur.type} {fragment} at position {cur.i}</li>;
			});
			result = <div id="result">
						<table ref="table">
							<thead><tr><th></th><th></th>{str2.split('').map((c,i) => <th key={i}>{c}</th>)}</tr></thead>
							<tbody>{loop(str1.length+1, i => 
								<tr key={i}>
									<th>{i>0?str1.charAt(i - 1):""}</th>
									
									{loop(str2.length+1, j => <td key={j}
										style={{opacity:0}}
										className={
												 (highlight.i==i&&highlight.j==j?      'highlighted':'')
											+ ' ' +(levenpath.some(p => p.i==i&&p.j==j)? 'onpath':'')}
										onMouseEnter={evt => this.setState({highlight: {i,j}})}
										onMouseLeave={evt => this.setState({highlight: {i:-1,j:-1}})}
										>{matrix[i][j]}</td>)}
								</tr>)}
							</tbody>
						</table>
						<div ref="resultText">
							<p>The Levenshtein distance is <strong>{matrix[str1.length][str2.length]}</strong>:</p>
							<ul>{steps}</ul>
							<label><input type="checkbox" checked={this.state.showTrivial} onChange={e => this.setState({showTrivial:(e.target as HTMLInputElement).checked})} /> Show non-changes</label>
						</div>
					</div>;
		}
		return <div>{header}{result}
			<footer><a href="https://github.com/phiresky/levenshtein-demo">Source code on GitHub</a> | <a href="http://leojiang.com/experiments/levenshtein/">Original code by Leo Jiang</a></footer>
		</div>
	}
	componentDidMount() {
		const keyupspan = $('<span class="str" style="width:auto;visibility:hidden;"></span>');
		$('body').append(keyupspan);
		$('input.str')
			.on('change', function() {
				keyupspan.text($(this).val());
				$(this).stop(true).animate({ 'min-width': 8 + ~~keyupspan.width() }, 200);
			})
			.on('keypress', e => {
				if (e.which === 13) this.onClick();
			});
	}
	getTableCell(i: number, j: number): HTMLTableCellElement {
		return (this.refs["table"] as any).tBodies[0].children[i].children[j+1];
	}
	componentWillUpdate(nextProps: any, nextState: GuiState) {
		if(nextState.str1 !== this.state.str1 || nextState.str2 !== this.state.str2) {
			const ret = levenshtein(nextState.str1, nextState.str2);
			this.levenpath = ret.levenpath; this.matrix = ret.matrix;
			$(this.refs["str1"]).val(nextState.str1).change(); $(this.refs["str2"]).val(nextState.str2).change();
		}
	}
	componentDidUpdate(prevProps: any, prevState: GuiState) {
		if(prevState.str1 !== this.state.str1 || prevState.str2 !== this.state.str2) {
			for (let i = 0; i <= this.state.str1.length; i++)
				for (let j = 0; j <= this.state.str2.length; j++) {
					$(this.getTableCell(i,j)).css({opacity:0}).delay(Math.max(i, j) * 200).animate({ opacity: 1 }, 400);
				}
						// after all cells fade in
			$(this.refs["resultText"]).css('opacity', 0).delay(Math.max(this.state.str1.length, this.state.str2.length) * 200).animate({ opacity: 1 }, 400);
		}
	}
}

(window as any).gui = ReactDOM.render(<Gui/>, document.getElementById("reactContent"));
