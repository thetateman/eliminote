(() => {
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
    })
    quill.on('text-change', (delta, oldDelta, source) => {
        if (source !== 'user') return;
        sock.emit('send-changes', delta);
    })

})();