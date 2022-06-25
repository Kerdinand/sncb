const timeTable = document.getElementsByClassName('depboard')[0];

const getStations = async () => {
	const res = await fetch(
		'https://api.irail.be/stations/?format=json&lang=en'
	);
	const obj = await res.json();
	return obj.station;
};

var map = L.map('map').setView([51.505, -0.09], 13);

let border = [];

const getBorders = async () => {
	const res = await fetch('belgium.geojson');
	const obj = await res.json();
	return obj.features[0].geometry.coordinates;
};

getStations().then((stations) => {
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '© OpenStreetMap',
	}).addTo(map);

	for (let i = 0; i < stations.length; i++) {
		let marker = new L.marker([
			stations[i].locationY,
			stations[i].locationX,
		]);
		marker.bindPopup(stations[i].name);
		marker.addTo(map);
		marker.on('click', onMarkerClick);
	}
});

const getLiveboard = async (station) => {
	const res = await fetch(
		`https://api.irail.be/liveboard/?station=${station}&lang=en&format=json&alerts=false`
	);
	const obj = await res.json();
	return obj;
};

const createTd = (content, mother) => {
	let td = document.createElement('td');
	td.innerHTML = content;
	mother.appendChild(td);
};

const onMarkerClick = (e) => {
	getLiveboard(e.target._popup._content).then((liveboard) => {
		const content = document.createElement('div');
		const header = document.createElement('h1');
		header.textContent = liveboard.station;
		content.appendChild(header);
		const table = document.createElement('table');
		const tableContent = ['🕐', '🚅', '🚉', '🎯', 'CX'];
		let tbody = document.createElement('tbody');
		console.log(liveboard);

		for (
			let i = 0;
			i < 40 && i < liveboard.departures.departure.length;
			i++
		) {
			let th = document.createElement('th');
			let delay = '';
			if (i === 0) {
				let trow = document.createElement('tr');
				let trow2 = document.createElement('tr');
				let thead = document.createElement('thead');
				table.appendChild(thead);
				thead.appendChild(trow);
				tableContent.forEach((item) => {
					let save = document.createElement('th');
					save.innerHTML = item;
					trow.appendChild(save);
				});
				table.appendChild(tbody);
				tbody.appendChild(trow2);
				let time = new Date(
					liveboard.departures.departure[i].time * 1000
				);
				if (liveboard.departures.departure[i].delay != '0') {
					delay = ' +' + liveboard.departures.departure[i].delay / 60;
				}
				createTd(time.toLocaleTimeString('it-IT') + delay, trow2);
				createTd(
					liveboard.departures.departure[i].vehicleinfo.shortname,
					trow2
				);
				createTd(liveboard.departures.departure[i].platform, trow2);
				createTd(liveboard.departures.departure[i].station, trow2);
				createTd(liveboard.departures.departure[i].canceled, trow2);
			} else {
				let trow = document.createElement('tr');
				trow.addEventListener('click', getTrainInfo);
				let time = new Date(
					liveboard.departures.departure[i].time * 1000
				);

				if (liveboard.departures.departure[i].delay != '0') {
					delay = ' +' + liveboard.departures.departure[i].delay / 60;
				}
				createTd(time.toLocaleTimeString('it-IT') + delay, trow);
				createTd(
					liveboard.departures.departure[i].vehicleinfo.shortname,
					trow
				);
				createTd(liveboard.departures.departure[i].platform, trow);
				createTd(liveboard.departures.departure[i].station, trow);
				createTd(liveboard.departures.departure[i].canceled, trow);
				tbody.appendChild(trow);
			}
		}
		content.appendChild(table);
		timeTable.replaceChildren(content);
	});
};

const getTrainInfo = (e) => {
	console.log(e.originalTarget.parentNode.childNodes[1].textContent);
};

getBorders().then((coordinates) => {
	let latlngs = [];
	coordinates[0].forEach((coordinate) => {
		/*saver = [];
		saver[0] = coordinate[1];
		saver[1] = coordinate[0];*/

		coordinate.push(coordinate[0]);
		coordinate.shift();
		latlngs.push(coordinate);
	});

	var polygon = L.polygon(latlngs, { color: 'red' }).addTo(map);
});
