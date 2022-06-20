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

const onMarkerClick = (e) => {
	getLiveboard(e.target._popup._content).then((liveboard) => {
		const content = document.createElement('div');
		const header = document.createElement('h1');
		const paragraph = document.createElement('p');
		header.textContent = liveboard.station;
		content.appendChild(header);

		liveboard.departures.departure.forEach((train) => {
			paragraph.textContent = train.vehicleinfo.shortnam;
		});
		content.appendChild(paragraph);
		timeTable.replaceChildren(content);
	});
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
