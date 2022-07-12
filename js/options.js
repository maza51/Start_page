window.onload = function() {

	var btnEXP = document.getElementById('exp');
	btnEXP.onclick = function() {
		var tmpe = {
			'Data': chrome.extension.getBackgroundPage().sp.Data,
			'DataF': chrome.extension.getBackgroundPage().sp.DataF
		}

		var blob = new Blob([JSON.stringify(tmpe)]);
		this.href = window.URL.createObjectURL(blob);
		this.download = "data.stp";
	}
	var btnIMP = document.getElementById('imp');
	btnIMP.onchange = function() {
		var file = this.files[0];
		if (file) {
			var reader = new FileReader();
			reader.onload = function(f) {
				var d = JSON.parse(f.target.result);
				chrome.extension.getBackgroundPage().sp.upData(d.Data, d.DataF);
			}
			reader.readAsText(file);
		}
	}
}