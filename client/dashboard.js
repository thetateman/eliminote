(() => {
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
        document.getElementById('doc-list').insertAdjacentHTML('beforeend', `<a href="/${title}">${title}</a><br>`)
        sock.emit('new-doc', title);
    });
    sock.on('send-doc-list', (documents) => {
        documents.forEach((doc) => {
            document.getElementById('doc-list').insertAdjacentHTML('beforeend', `<a href="/${doc}">${doc}</a><br>`)
        });
    });

    sock.emit('get-doc-list', '');
})();