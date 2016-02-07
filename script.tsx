import * as React from 'react';
import * as ReactDOM from 'react-dom';

function levenshtein(str1: string, str2: string) {
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
	let levenpath: {i:number, j:number, type?:string}[] = [];
	let j = l2;
	for (let i = l1; i >= 0 && j >= 0;)
		for (j = l2; i >= 0 && j >= 0;) {
			levenpath.push({i, j});
			let t = i;
			i = paths[i][j][0];
			j = paths[t][j][1];
		}
	levenpath = levenpath.reverse();
	return { matrix: m, levenpath: levenpath };
}

function loop<T>(i: number, callback: (i:number) => T): T[] {
	return Array.apply(null, new Array(i)).map((e:any, i:number) => callback(i));
}

class Gui extends React.Component<{}, {str1: string, str2: string}> {
	constructor() {
		super();
		this.state = {str1:"", str2:""};
	}
	onClick(e: Event) {
		this.setState({str1: $('#str1').val().trim().toLowerCase(),
			str2: $('#str2').val().trim().toLowerCase()});
	}
	render() {
		const {str1, str2} = this.state;
		const {matrix,levenpath} = levenshtein(str1, str2);
		for (let i = 0; i < levenpath.length; i++) {
			const last = levenpath[i - 1], cur = levenpath[i];
			if (i !== 0) {
				if (cur.i === last.i + 1 && cur.j === last.j + 1 && matrix[cur.i][cur.j] !== matrix[last.i][last.j]) cur.type = 'replace';
				else if (cur.i === last.i && cur.j === last.j + 1) cur.type = 'insert';
				else if (cur.i === last.i + 1 && cur.j === last.j) cur.type = 'delete';
			}
		}
		const t = levenpath.filter(x => !!x.type);
		const steps = t.map((cur,i) => {
			const dot = i < t.length - 1 ? ",":".";
			switch(cur.type) {
				case 'replace': return <p>replace <em>{str1.charAt(cur.i - 1)}</em> with <em>{str2.charAt(cur.j - 1)}</em> at position {cur.i}{dot}</p>;
				case 'insert': return <p>insert <em>{str2.charAt(cur.j - 1)}</em> at position {cur.i}{dot}</p>;
				case 'delete': return <p>delete <em>{str1.charAt(cur.i - 1)}</em> at position {cur.i}{dot}</p>;
			}
			return '';
		});
		steps.unshift(<p>The Levenshtein distance is <strong>{matrix[str1.length][str2.length]}</strong>:</p>);
		return (
			<div>
				<div className="page-header">
					<h1>Levenshtein Distance Calculator</h1>
					<p>How many insertions, deletions, and substitutions does it take to turn <input id="str1" className="str" defaultValue="elephant" placeholder="word 1" tabIndex={1} /> into <input id="str2" className="str" defaultValue="relevant" placeholder="word 1" tabIndex={2} />?</p>
					<button type="button" className="btn btn-primary" onClick={this.onClick.bind(this)} tabIndex={3}>Calculate Levenshtein distance</button>
				</div>
				{str1.length > 0 && str2.length > 0 ?
					<div id="result">
						<table ref="table">
							<thead><tr><th></th><th></th>{str2.split('').map((c,i) => <th key={i}>{c}</th>)}</tr></thead>
							<tbody>{loop(str1.length+1, i => 
								<tr>
									<th>{i>0?str1.charAt(i - 1):""}</th>
									{loop(str2.length+1, j => <td key={j} style={{opacity:0, fontWeight:levenpath.some(p => p.i==i&&p.j==j)?'700':'inherit'}}>{matrix[i][j]}</td>)}
								</tr>)}
							</tbody>
						</table>
						{steps}
					</div>
				: <p>Don't know what to do? Try <i>elephant</i> and <i>relevant</i>, <i>Saturday</i> and <i>Sunday</i>, or <i>Google</i> and <i>Facebook</i>.</p>}
      		</div>
    	);
	}
	componentDidMount() {
		const keyupspan = $('<span style="width:auto;visibility:hidden;"></span>');
		$('body').append(keyupspan);
		$('input.str')
			.on('keyup', function() {
				keyupspan.text($(this).val());
				$(this).stop(true).animate({ 'min-width': 8 + ~~keyupspan.width() }, 200);
			})
			.on('keypress', function(e) {
				if (e.which === 13)
					$('#submit').click();
			});
	}
	componentDidUpdate() {
		for (let i = 0; i <= this.state.str1.length; i++)
			for (let j = 0; j <= this.state.str2.length; j++) {
				$(this.refs["table"]).find('tr').eq(i + 1).find('td').eq(j).css({opacity:0}).delay(Math.max(i, j) * 200).animate({ opacity: 1 }, 400);
			}
					// after all cells fade in
		$('#result').find('p').css('opacity', 0).delay(Math.max(this.state.str1.length, this.state.str2.length) * 200).animate({ opacity: 1 }, 400);
	}
}

ReactDOM.render(<Gui/>, document.getElementById("reactContent"));