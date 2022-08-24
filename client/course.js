(() => {
    let location = window.location.href.split("CourseView_")[window.location.href.split("CourseView_").length - 1];
    localStorage.currentCourse = decodeURIComponent(location);
    const sock = io();
    const form = document.querySelector('#todo-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let todoText = document.querySelector('#todo-text').value;
        console.log(todoText);
        let newTodo = `<input type="checkbox"><span>${todoText}</span>`;
        form.insertAdjacentHTML('afterend', newTodo);
    });
    const newDocButton = document.getElementById('new-doc');
    newDocButton.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('title-input').value;
        console.log(`got title: ${title}`)
        document.getElementById('doc-list').insertAdjacentHTML('beforeend', `<a href="/${encodeURIComponent(localStorage.currentCourse)}_DocumentView_${encodeURIComponent(title)}">${title}</a><br>`)
        sock.emit('new-doc', {course: localStorage.currentCourse, title: title});
    });
    sock.on('send-doc-list', (documents) => {
        documents.forEach((doc) => {
            document.getElementById('doc-list').insertAdjacentHTML('beforeend', `<a href="/${encodeURIComponent(localStorage.currentCourse)}_DocumentView_${encodeURIComponent(doc)}">${doc}</a><br>`)
        });
    });

    sock.emit('get-doc-list', localStorage.currentCourse);
    // Force reload when page is accessed with the back button.
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
          // page was restored from the bfcache
          window.location.reload();
        }
    });
    
})();