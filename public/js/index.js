(function () {
	var windowChildren = [];
	var selectedItem = null;
	var knownLibs = {
		"jQuery 1.11.1": "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
		"AngularJS 1.2.18": "//ajax.googleapis.com/ajax/libs/angularjs/1.2.18/angular.min.js"
	}
	
	//Determines if an item exists in the given array
	var arrayContains = function(array, item) {
		return array.indexOf(item) != -1;
		for (var i = 0; i < array.length; ++i) {
			if (array[i] === item)
				return true;
		}
		return false;
	};
	
	var compareCaseInsensitive = function(a, b) {
		if (a.toLowerCase() < b.toLowerCase()) return -1;
		if (a.toLowerCase() > b.toLowerCase()) return 1;
		return 0;
	};
	
	var onDocumentLoaded = function() {
		//Get a list of all of window's children before adding more.
		for (var x in window) {
			windowChildren.push(x);
		}
	
		//Load all the external libraries
		var librariesText = localStorage.getItem('libraries');
		var extensionMode = "chrome" in window && "extension" in window.chrome;
		if (librariesText) {
			var libraries = librariesText.split('\n');
			for (var i = 0; i < libraries.length; i++) {
				var url = libraries[i];
				if (typeof(url) == "string") {
					url = url.trim();
				}
				if (extensionMode) {
					try {
						var libHttpRequest = new XMLHttpRequest();
						libHttpRequest.open('GET', url, false);
						libHttpRequest.send(null);
						eval(libHttpRequest.responseText);
					}
					catch (ex)
					{
						window[url] = ex;
					}
				} else {
					var fileref=document.createElement('script');
					fileref.setAttribute("src", url);
					document.head.appendChild(fileref);
				}
			}
		}
		
		var sidebar = document.getElementById('sidebar');
		var rootItems = ['chrome', 'document', 'navigator', 'location', 'history', 'window'];
		document.getElementById('libraries').value = librariesText;
		for (var x in window) {
			if (!arrayContains(windowChildren, x)) {
				rootItems.push(x);
			}
		}
		rootItems.sort(compareCaseInsensitive);
		for (var i = 0; i < rootItems.length; ++i) {
			if (rootItems[i] in window) {
				addSubItem(sidebar, window, rootItems[i]);
			}
		}
		for (var i = 0; i < knownLibs.length; ++i) {
			//TODO: Add checkboxes for each lib
		}
	};
	
	var fillObject = function(element, object) {
		if (typeof(object) == 'string') {
			return;
		}
		if (typeof(element) == 'string') {
			element = document.getElementById(element);
		}
		var fields = [];
		for (var x in object) {
			if (object[x] !== object)
				fields.push(x);
		}
		fields.sort(compareCaseInsensitive);
		for (var i = 0; i < fields.length; ++i){
			addSubItem(element, object, fields[i]);
		}
	};
	
	var addSubItem = function(element, object, x) {
		if ((object == window || object == top) && (x == 'sidebar' || x == 'windowChildren' || x == 'libraries' || x == 'librariesText' || x == 'selectedItem'))
			return;
		var subelement = document.createElement('div');
		var header = document.createElement('a');
		var text = document.createElement('span');
		var icon = document.createElement('img');
		var subitemcontainer = document.createElement('div');
		subitemcontainer.style.marginLeft = '20px';
		icon.style.marginLeft = '5px';
		icon.style.marginRight = '5px';
		var instance = object[x];
		var type = typeof(instance);
		if (instance == null || instance == undefined)
			text.innerHTML = x + ' <span style="color:red;">' + String(instance) + '</span>';
		else
			text.innerHTML = x + ' <span style="color:blue;">' + type + '</span>';
		switch (type) {
			case "boolean":
				icon.src = 'public/images/installed_ovr.png';
				break;
			case "string":
				icon.src = 'public/images/template_obj.png';
				break;
			case "number":
				icon.src = 'public/images/correction_cast.png';
				break;
			case "object":
				icon.src = 'public/images/envvar_obj.png';
				break;
			case "function":
				icon.src = 'public/images/run_co.png';
				for (var y in instance) {
					icon.src = 'public/images/class_obj.png';
					break;
				}
				break;
			case "event":
				icon.src = 'public/images/methpro_obj.png';
				break;
			default:
				icon.src = 'public/images/maxlevel_co.png';
				break;
		}
		if (instance == null)
			if (x[0] == 'o' && x[1] == 'n')
				icon.src = 'public/images/methpro_obj.png';
			else icon.src = 'public/images/maxlevel_co.png';
		header.appendChild(icon);
		header.appendChild(text);
		header.tag = instance;
		header.addEventListener("click", expandElement);
		
		subelement.appendChild(header);
		subelement.appendChild(subitemcontainer);
		element.appendChild(subelement);
	}
	
	var selectElement = function(newElement) {
		if (newElement == undefined)
			newElement = this;
		if (selectedItem != null) {
			selectedItem.setAttribute('style', '');
		}
		selectedItem = newElement;
		selectedItem.setAttribute('style', 'background-color: lightblue');
		var selectedInfo = document.getElementById('selectedInfo');
		while (selectedInfo.children.length > 0)
			selectedInfo.removeChild(selectedInfo.children[0]);
		var title = document.createElement('h1');
		title.innerHTML = newElement.innerHTML;
		var content = document.createElement('textarea');
		var text = String(newElement.tag);
		content.setAttribute('style', 'width:600px; height:100px;');
		content.disabled = 'disabled';
		content.value = text;
		selectedInfo.appendChild(title);
		selectedInfo.appendChild(content);
	};
	
	var expandElement = function() {
		if (this.parentElement != null)
			var content = this.parentElement.children[1];
		else var content = this.parentNode.children[1];
		if (content.children.length == 0)
			fillObject(content, this.tag);
		else while (content.children.length > 0)
			content.removeChild(content.children[0]);
		selectElement(this);
	};
	
	var onTextChange = function() {
		localStorage.setItem(this.id, this.value);
	}
	
	var onReloadClick = function() {
		location.href = location.href;
	};
	
	var onConsoleToggle = function() {
		document.getElementById('console').setAttribute('style', 'display: ' + (this.checked ? 'block' : 'none'));
	}
	
	var onPanelToggle = function() {
		document.getElementById('panel').setAttribute('style', 'display: ' + (this.checked ? 'block' : 'none'));
	}
	
	var onConsoleRun = function() {
		try { 
			document.getElementById('consoleOutput').innerText = eval(document.getElementById('consoleInput').value);
			document.getElementById('consoleOutput').style.color = ''; 
		} 
		catch (ex) { 
			document.getElementById('consoleOutput').innerText = ex; 
			document.getElementById('consoleOutput').style.color = 'red'; 
		}
	}
	
	document.getElementById('reload').addEventListener('click', onReloadClick);
	document.getElementById('libraries').addEventListener('keyup', onTextChange);
	document.getElementById('consoleToggle').addEventListener('click', onConsoleToggle);
	document.getElementById('consoleToggle').addEventListener('change', onConsoleToggle);
	document.getElementById('panelToggle').addEventListener('click', onPanelToggle);
	document.getElementById('panelToggle').addEventListener('change', onPanelToggle);
	document.getElementById('consoleRun').addEventListener('click', onConsoleRun);
	
	
	onDocumentLoaded();
})();
