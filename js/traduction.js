function Traduction() {
  this.trad = {};
  this.watchedObjects = [];
  this.defaultLanguage = "en";

  this.init = function(defaultLanguage) {
    var objects = $("[data-traduction]"),
        newThis = this;

    this.watchedObjects = [];
    objects.each(function (i, e) {
      var je = $(e),
          id = je.text(),
          idAttr = je.attr("data-traduction");
      if (idAttr !== "") {
        id = idAttr;
      } else if (id[0] == "{" && id[id.length - 1] == "}") {
        id = id.substr(1, id.length - 2);
      } else {
        return ;
      }
      newThis.watchedObjects.push({
        obj: je,
        id: id
      });
      this.defaultLanguage = defaultLanguage;
    });
  }

  this.load = function(fileData) {
    try {
      console.log(fileData);
      var obj = JSON.parse(fileData);
      for (var lang in obj) {
        if (this.trad[lang] === undefined) {
          this.trad[lang] = {};
        }
        var langItems = obj[lang];
        for (id in langItems) {
          this.trad[lang][id] = langItems[id];
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  this.reset = function() {
    this.trad = {};
    this.watchedObjects = {};
  }

  this.update = function(language) {
    for (i in this.watchedObjects) {
      var item = this.watchedObjects[i];

      if (item !== undefined && item.id !== undefined) {
        var tradOptions = this.trad[language] || this.trad[this.defaultLanguage];

        if (tradOptions !== undefined) {
          var res = tradOptions[item.id];

          if (res !== undefined) {
            item.obj.text(res);
          }
        }
      }
    }
  }
}