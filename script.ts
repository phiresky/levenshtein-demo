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
	let levenpath: [number, number][] = [];
	let j = l2;
	for (let i = l1; i >= 0 && j >= 0;)
		for (j = l2; i >= 0 && j >= 0;) {
			levenpath.push([i, j]);
			let t = i;
			i = paths[i][j][0];
			j = paths[t][j][1];
		}
	levenpath = levenpath.reverse();
	return { matrix: m, levenpath: levenpath };
}


$(document).ready(function() {
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

	let leventimer: number;
	$('#submit').on('click', function(e) {
		e.preventDefault();
		const str1 = $('#str1').val().trim().toLowerCase(),
			str2 = $('#str2').val().trim().toLowerCase();
		if (!str1.length || !str2.length)
			return;
		const {matrix,levenpath} = levenshtein(str1, str2);
		clearTimeout(leventimer);

		let html = '<tr><th></th><th></th>';
		for (const c of str2) html += '<th>' + c + '</th>';
		html += '</tr>';
		for (let i = 0; i <= str1.length; i++) {
			if (i !== 0)
				html += '<tr><th>' + str1.charAt(i - 1) + ' </th>';
			else
				html += '<tr><th></th>';
			for (let j = 0; j <= str2.length; j++)
				html += '<td style="opacity:0;">' + ('  ' + matrix[i][j]).slice(-3).replace('  ', '&nbsp; ') + '</td>';
			html += '</tr>';
		}

		const table = $('#result').find('table');
		table.html(html);
		const steps: string[] = [];
		for (let i = 0; i < levenpath.length; i++) {
			const last = levenpath[i - 1];
			const cur = levenpath[i];
			table.find('tr').eq(cur[0] + 1).find('td').eq(cur[1]).css('font-weight', 700);
			if (i !== 0) {
				if (cur[0] === last[0] + 1 && cur[1] === last[1] + 1) {
					if (matrix[cur[0]][cur[1]] !== matrix[last[0]][last[1]])
						steps.push('replace <em>' + str1.charAt(cur[0] - 1) + '</em> with <em>' + str2.charAt(cur[1] - 1) + '</em> at position ' + cur[0]);
				} else if (cur[0] === last[0] && cur[1] === last[1] + 1) {
					steps.push('insert <em>' + str2.charAt(cur[1] - 1) + '</em> at position ' + cur[0]);
				} else if (cur[0] === last[0] + 1 && cur[1] === last[1]) {
					steps.push('delete <em>' + str1.charAt(cur[0] - 1) + '</em> at position ' + cur[0]);
				}
			}
		}

		for (const i = 0; i <= str1.length; i++)
			for (const j = 0; j <= str2.length; j++) {
				table.find('tr').eq(i + 1).find('td').eq(j).delay(Math.max(i, j) * 200).animate({ opacity: 1 }, 400);
			}
		$('#result').find('p').css('opacity', 0);
		// after all cells fade in
		leventimer = setTimeout(function() {
			let str: string;
			if (steps.length === 0)
				str = 'the 2 strings are equal';
			else if (steps.length === 1)
				str = steps[0];
			else if (steps.length === 2)
				str = steps.join(' and ');
			else {
				str = steps.slice(0, -1).join(', ') + ', and ' + steps[steps.length - 1];
			}
			str = 'The Levenshtein distance is <strong>' + matrix[str1.length][str2.length] + '</strong>: ' + str + '.';
			$('#result').find('p').html(str).animate({ opacity: 1 }, 400);
		}, Math.max(str1.length, str2.length) * 200);
	});
});