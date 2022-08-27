(() => {
    localStorage.clear();
    const sock = io();
    const form = document.querySelector('#todo-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let todoText = document.querySelector('#todo-text').value;
        console.log(todoText);
        let newTodo = `<input type="checkbox"><span>${todoText}</span>`;
        form.insertAdjacentHTML('afterend', newTodo);
    });
    const newCourseButton = document.getElementById('new-course');
    newCourseButton.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('title-input').value;
        console.log(`got title: ${title}`)
        document.getElementById('course-list').insertAdjacentHTML('beforeend', `<a href="/CourseView_${encodeURIComponent(title)}">${title}</a><br>`)
        sock.emit('new-course', title);
    });
    sock.on('send-course-list', (courses) => {
        Object.keys(courses).forEach((courseTitle) => {
            document.getElementById('course-list').insertAdjacentHTML('beforeend', `<a href="/CourseView_${encodeURIComponent(courseTitle)}">${courseTitle}</a><br>`)
        });
    });

    sock.emit('get-course-list', '');
    // Force reload when page is accessed with the back button.
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
          // page was restored from the bfcache
          window.location.reload();
        }
    });
})();