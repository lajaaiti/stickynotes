var sort_active = false;
var mouse_on_sortable = false;
var sorted_file_X = 0 , sorted_file_Y = 0;


///// CONSTRUCTEURS /////

function create_note(options) {
    
    /* options doit / peut avoir la forme suivante :
    
    {
    contenu:"du texte",
    top: (nombre),
    left: (nombre)
    }
    
    */
    
    // Options par défaut (si non renseignées)
    
    if (!options) { // On a voulu appeler la fonction sans aucun paramètre
        var options = {};
    }
    
    if (!options.contenu) {
        options.contenu = "";
    }
    
    if (!options.top) {
        options.top = 0;
    }
    
    if (!options.left) {
        options.left = 0;
    }
    
    if (options.folder) { // Mode "file"
        
        var file = document.createElement("div");
    
        file.className = "file";
    
        file.innerHTML = options.contenu;
    
        options.folder.querySelector(".folder_cnt").appendChild(file);
    
        return file;
        
    } else { // Mode "note"
          
        var note = document.createElement("div");
    
        note.className = "note";
        
        note.innerHTML = "<div class = 'bar'></div><textarea placeholder = 'Note...'></textarea>";
        
        note.querySelector("textarea").value = options.contenu;
        
        note.style.left = options.left + "px";
        note.style.top = options.top + "px";
        
        document.getElementById("container").appendChild(note);
        
        $(note).draggable({
            handle:".bar",
            containment:"parent",
            stack:".note , .folder , .file"
        });
        
        return note;
            
        }

}


function create_folder(options) {
    
    if (!options) { // On a voulu appeler la fonction sans aucun paramètre
        var options = {};
    }
    
    if (!options.top) {
        options.top = 0;
    }
    
    if (!options.left) {
        options.left = 0;
    }
    
    //////
    
    var folder = document.createElement("div");
    
    folder.className = "folder";
    
    folder.innerHTML = "<div class = 'bar'></div><div class = 'folder_cnt'></div>";
    
    folder.style.left = options.left + "px";
    folder.style.top = options.top + "px";
    
    document.getElementById("container").appendChild(folder);
    
    $(folder).draggable({
        handle:".bar",
        containment:"parent",
        stack:".note , .folder , .file"
    });

    $(folder).droppable({
        accept:".note",
        tolerance:"touch",
        drop:function(event, ui) {
            var note = ui.draggable[0];
        
            note_dropped(note , this);
        
        }
    });
    
    $(folder.querySelector(".folder_cnt")).sortable({
    
    connectWith:".folder_cnt",
    
    over:function(event, ui) {
        mouse_on_sortable = true;
    },
    
    out:function(event, ui) {
        
        // S'assurer qu'on est bien en-dehors de la liste
        // (L'événement out est aussi déclenché quand on relache nos .file)
        
        if (sort_active) { // Le "vrai" événément out
            
            mouse_on_sortable = false;
            
        }
        
    },
    
    start:function(event, ui) {
        sort_active = true;
    },
    
    sort:function(event, ui) {
        
        var file = ui.item[0];
        
        sorted_file_X = file.offsetLeft + this.parentNode.offsetLeft;
        sorted_file_Y = file.offsetTop + this.parentNode.offsetTop;
        
        console.log(sorted_file_X + " / " + sorted_file_Y);
        
    },
    
    beforeStop:function(event, ui) {
        sort_active = false;
    },
    
    stop:function(event, ui) {
        
        if (!mouse_on_sortable) { // On est certains de ne pas être en train de survoler notre élément sortable
            
            
            var file = ui.item[0];
            
            file_dropped(file , document.getElementById("container"));
            
            }
        
        }
    
    });
    
    
    // BONUS : Donner la méthode create_note() à tout objet .folder :
    
    folder.create_note = function(options) {
        
        options.folder = this; // S'assurer que le paramètre folder est bien pré-rempli
        
        return create_note(options);
        
    }
    
    
    return folder;
    
}

///////////////////////////////////////////


function note_dropped(note, folder) {
    
    var contenu = note.querySelector("textarea").value;

    note.parentNode.removeChild(note); // Supprimer l'élément .note de son parent (#container)
    

    create_note({
        contenu:contenu,
        folder:folder
    });
        
}


function file_dropped(file, target) {
    
    var contenu = file.innerHTML;

    file.parentNode.removeChild(file);
    
    create_note({
        contenu:contenu,
        top:sorted_file_Y,
        left:sorted_file_X
    });
    
}