
if (typeof StartPadge == "undefined" || !StartPadge) { var StartPadge = {}; }
var sp = StartPadge;

sp = {
	Data : {},
	DataF : {},
	bgImage : '',
	complete : 0,
	getdata: function() {
		sp.db = openDatabase("DataSites", "0.1", "A list of to do items.", 200000);
		if (!sp.db) {
			alert("Failed to connect to database.");
			return;
		}
		sp.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM Site", [], function(tx, result) {
				for (var i = 0; i < result.rows.length; i++) {

					sp.Data[i] = {
						url: result.rows.item(i).url,
						img: result.rows.item(i).img,
						title: result.rows.item(i).title,
						folder: result.rows.item(i).folder
					}
				}
				sp.complete++;
			}, function(tx, error) {
				tx.executeSql("CREATE TABLE Site (url TEXT, title TEXT, img TEXT, folder INTEGER)", [], null, null);
				sp.complete++;
				console.log('CREATE TABLE Site');
			});
			tx.executeSql("SELECT * FROM Fold", [], function(tx, result) {
				for (var i = 0; i < result.rows.length; i++) {

					sp.DataF[i] = {
						url: result.rows.item(i).url,
						img: result.rows.item(i).img,
						title: result.rows.item(i).title,
						folder: result.rows.item(i).folder
					}
				}
				sp.complete++;
			}, function(tx, error) {
				tx.executeSql("CREATE TABLE Fold (url TEXT, title TEXT, img TEXT, folder INTEGER)", [], null, null);
				sp.complete++;
				console.log('CREATE TABLE Fold');
			});
			tx.executeSql("SELECT * FROM Settings", [], function(tx, result) {
				for (var i = 0; i < result.rows.length; i++) {
					if (result.rows.item(i).key == 'bgImage') {
						sp.bgImage = result.rows.item(i).value;
					}
				}
				sp.complete++;
			}, function(tx, error) {
				tx.executeSql("CREATE TABLE Settings (key TEXT UNIQUE, value TEXT)", [], null, null);
				sp.complete++;
				console.log('CREATE TABLE Settings');
			});
		})
	},
	getcontextmenu: function() {
		chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
			switch (request.command) {
				case "shot":
					sp.capture(request.source, tabInfo.title);
					break;
			};
		});

		chrome.contextMenus.create({
			"title": 'Save tab',
			"contexts": ["all"],
			"id": "context_tab"
		});

		chrome.contextMenus.onClicked.addListener(function(info, tab) {
			var tabURL = tab && tab.url;
			sp.savesite(tabURL, '', tab.title, 0);
		});
	},
	savesite : function(url, img, title, folder) {
		var nT = 0;
		for(var i in sp.Data){
			nT = Number(i) + 1;
		}
		sp.Data[nT] = {url : url, img : img, title : title, folder : folder};
		sp.capture(nT, url);
	},
	upData: function(data, dataf) {
        console.log('qwe');
		var fixD = {};
		var fixF = {};
		sp.Data = data;
		sp.DataF = dataf;
		sp.db.transaction(function(tx) {
			tx.executeSql("DELETE FROM Site", null, null);
			for (var i in sp.Data) {
				if (sp.Data[i] != undefined) {
					console.log('undefined');
					fixD[i] = sp.Data[i];
					tx.executeSql("INSERT OR REPLACE INTO Site (url, title, img, folder) values(?, ?, ?, ?)", [sp.Data[i].url, sp.Data[i].title, sp.Data[i].img, sp.Data[i].folder], null, null);
				};
			}
			sp.Data = fixD;
			tx.executeSql("DELETE FROM Fold", null, null);
			for (var i in sp.DataF) {
				if (sp.DataF[i] != undefined) {
					fixF[i] = sp.DataF[i];
					tx.executeSql("INSERT OR REPLACE INTO Fold (url, title, img, folder) values(?, ?, ?, ?)", [sp.DataF[i].url, sp.DataF[i].title, sp.DataF[i].img, sp.DataF[i].folder], null, null);
				};
			}
			sp.DataF = fixF;
		});
	},
	capture_screen: function(idt, url) {
		setTimeout(function() {
            try {
                chrome.tabs.captureVisibleTab(null, {
                    format: "png"
                }, function(dataUrl) {
                    var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "html:canvas");
                    var context = canvas.getContext("2d");
                    var image = document.createElement("img");
                    image.onload = function() {
                        try {
                            console.log('image loaded, cropping');
							canvas.width = image.width / 2;
							canvas.height = image.height / 2;
							context.drawImage(image,
								0, 0,
								image.width - 16, image.height - 16,
								0, 0,
								image.width / 2, image.height / 2
							);
							console.log('image created');
							var croppedDataUrl = canvas.toDataURL("image/png");
							sp.Data[idt].img = croppedDataUrl;
							sp.upData(sp.Data, sp.DataF);
							console.log(croppedDataUrl);
                            image = null
                        } catch (err) {
                            console.log(err)
                        }
                    };
                    image.src = dataUrl
                })
            } catch (err) {
                console.log(err)
            }
        }, 500)
	},
	capture: function(idt, url) {
		chrome.windows.create({
			url: url,
			focused: !1,
			type: "popup",
			left: 9999,
			top: 9999,
			height: 700,
			width: 1030
		}, function(a) {
			var tmpid = a.id;
			chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tabInfo) {
				if (tabInfo.status === 'complete') {
					if (tmpid + 1 == tabInfo.id) {
						setTimeout(function() {
							chrome.tabs.captureVisibleTab(a.id, {
								format: "png"
							}, function(dataUrl) {
								var canvas = document.createElement("canvas");
								console.log('created canvas');
								var image = new Image();
								image.onload = function() {
									console.log('image loaded, cropping');
									canvas.width = image.width / 2;
									canvas.height = image.height / 2;
									var context = canvas.getContext("2d");
									context.drawImage(image,
										0, 0,
										image.width - 16, image.height - 16,
										0, 0,
										image.width / 2, image.height / 2
									);
									console.log('image created');
									var croppedDataUrl = canvas.toDataURL("image/png");
									chrome.windows.remove(a.id)
									sp.Data[idt].img = croppedDataUrl;
									sp.upData(sp.Data, sp.DataF);
								}
								image.src = dataUrl;
							});
						}, 500);
						chrome.tabs.onUpdated.removeListener(listener);
					}
				}
			});
		})
	},
	imageto64: function(url) {
		var canvas = document.createElement("canvas");
		console.log('created canvas');
		var image = new Image();
		image.onload = function() {
			console.log('image loaded, cropping');
			canvas.width = image.width;
			canvas.height = image.height;
			var context = canvas.getContext("2d");
			context.drawImage(image,
				0, 0,
				image.width, image.height,
				0, 0,
				image.width, image.height
			);
			console.log('image created');
			var croppedDataUrl = canvas.toDataURL("image/png");
			sp.bgImage = croppedDataUrl;
			sp.db.transaction(function(tx) {
				tx.executeSql("INSERT OR REPLACE INTO Settings (key, value) values(?, ?)", ['bgImage', croppedDataUrl], null, null);
			});
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.reload(tab.id);
			});
		}
		image.onerror = function() {
			alert('No image in the current url');
		}
			
		image.src = url;
	}
}

sp.getdata();
sp.getcontextmenu();
