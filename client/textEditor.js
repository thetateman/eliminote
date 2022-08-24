(() => {
    let location = window.location.href.split("_DocumentView_")[window.location.href.split("_DocumentView_").length - 1];
    localStorage.currentDocument = location;
    const TOOLBAR_OPTIONS = [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["bold", "italic", "underline"],
        [{ color: [] }, {background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ align: [] }],
        ["image", "blockquote", "code-block"],
        ["clean"],
    ];
    const quill = new Quill(document.getElementById('page-root'), { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS }});
    const sock = io();
    sock.on('message', (data) => console.log(data));
    sock.on('receive-changes', (delta) => {
        console.log(delta);
        quill.updateContents(delta);
    });
    sock.on('load-document', (doc) => {
        quill.setContents(doc);
        quill.enable();
    });
    quill.on('text-change', (delta, oldDelta, source) => {
        if (source !== 'user') return;
        sock.emit('send-changes', {delta: delta, course: localStorage.currentCourse, title: localStorage.currentDocument});
    });
    sock.emit('get-doc', {course: localStorage.currentCourse, title: localStorage.currentDocument});
    const interval = setInterval(() => {
        sock.emit('save-doc', quill.getContents())
    }, 2500);

})();