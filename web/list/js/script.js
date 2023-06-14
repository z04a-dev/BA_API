let list = document.querySelector('#list')
let refresh = document.querySelectorAll('button')[2]
// list.appendChild(createli(inp.value))


let blockedarr = ['bgitu','school10','info']
function createli(val) {
    let li = document.createElement('li')
    let text = document.createElement('h1')
    let btn = document.createElement('button')
    if(blockedarr.includes(val)) {
        btn.setAttribute("disabled","true")
    } else {
        btn.addEventListener('click', (evt) =>  {
            fetch("http://" + window.location.host + "/api/dellibrary", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "info": val
            }
            }).then(response => response.status)
            .then(response => {
                console.log(response)
                if(response == 200) {
                    list.replaceChildren()
                    getList()
                }
            })
        })
    }
   
    btn.innerHTML = "Удалить"
    btn.style = "font-size: 24px;"
    btn.className = "btndelete"
    text.innerHTML = val
    li.appendChild(text)
    li.appendChild(btn)
    return li
}
function getList() {
    fetch("http://" + window.location.host + "/api/getlist", {
    method: "GET",
headers: {
    "Content-type": "application/json; charset=UTF-8",
}
}).then(response => response.json())
.then(response => {
    response.forEach(element => {
        list.appendChild(createli(element))
    });
})
}

getList()

refresh.addEventListener('click', (evt) => {
    list.replaceChildren()
    getList()
})


  