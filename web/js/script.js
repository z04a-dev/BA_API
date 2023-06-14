let btn = document.querySelectorAll('button')[3]
let list = document.querySelector('#list')
let inp = document.querySelector('#inp')
let gen = document.querySelectorAll('button')[2]
let nameLibrary = document.querySelector("#label")
let waiting = false
let arr = []


function createli(val) {
    let li = document.createElement('li')
    let text = document.createElement('h1')
    let btn = document.createElement('button')
    btn.addEventListener('click', (evt) =>  {
        var index = arr.indexOf(val);
        if (index !== -1) {
            arr.splice(index, 1);
            evt.target.closest('li').remove()
        }
    })
    btn.innerHTML = "Удалить"
    btn.style = "font-size: 24px;"
    btn.className = "btndelete"
    text.innerHTML = val
    li.appendChild(text)
    li.appendChild(btn)
    return li
}

function animWrong() {
    inp.style = "background-color: white;"
  }
  
  var a = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"A","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu"};
  function transliterate(word){
    return word.split('').map(function (char) {
      return a[char] || char;
    }).join("");
  }

  var b = {"YO":"Ё","I":"Й","TS":"Ц","U":"У","K":"К","E":"Е","N":"Н","G":"Г","SH":"Ш","SCH":"Щ","Z":"З","H":"Х","'":"Ъ","yo":"ё","i":"й","ts":"ц","u":"у","k":"к","e":"е","n":"н","g":"г","sh":"ш","sch":"щ","z":"з","h":"х","'":"ъ","F":"Ф","I":"Ы","V":"В","A":"А","P":"П","R":"Р","O":"О","L":"Л","D":"Д","ZH":"Ж","E":"Э","f":"ф","i":"ы","v":"в","a":"а","p":"п","r":"р","o":"о","l":"л","d":"д","zh":"ж","e":"э","Ya":"Я","CH":"Ч","S":"С","M":"М","I":"И","T":"Т","'":"Ь","B":"Б","YU":"Ю","ya":"я","ch":"ч","s":"с","m":"м","i":"и","t":"т","'":"ь","b":"б","yu":"ю"};
  function untransliterate(word){
    return word.split('').map(function (char) {
      return b[char] || char;
    }).join("");
  }


//   var ru = ['й','ц','у','к','е','н','г','ш','щ','з','х','ф','ы','в','а','п','р','о','л','д','ж','э','я','ч','с','м','и','т','ь','б','ю','ъ']

//   upRU = ru.map(function(x){ return x.toUpperCase(); })

  var ru = `/[йцукенгшщзхъфывапролджэячсмитьбюЙЦУКЕНГШЩХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮЁё]+/`
  var en = `/[qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM]+/`
btn.addEventListener('click', (evt) => {
    if(inp.value != '' && !arr.includes(inp.value) && !/[A-Za-z]/.test(inp.value)) {
        arr.push(inp.value)
        list.appendChild(createli(inp.value))
        inp.value = ''
    } else {
        inp.style = "background-color: red;"
        setTimeout(animWrong, 250);
        if (/[A-Za-z]/.test(inp.value)) alert("Использование латиницы в наименовании комнат запрещено.")
    }
})
gen.addEventListener('click', (evt) => {
    if(arr.length != 0 && nameLibrary.value != '') {
        gen.disabled = true
        if(!waiting) {
            waiting = true
            fetch(document.URL + "api/occurence", {
                method: "POST",
                headers: {
                  "info": transliterate(nameLibrary.value).replace(/\s+/g, '')
                }
              })
                .then((response) => response.text())
                .then((responseText) => {
                    arr.forEach(element => {
                        arr[arr.indexOf(element)] = untransliterate(element)
                    });
                    console.log(responseText);
                    if(responseText == 'ok') {
                        if(nameLibrary != '' && arr.length > 0) {
                            fetch(document.URL + "generator", {
                                method: "POST",
                                body: JSON.stringify(arr),
                            headers: {
                                "Content-type": "application/json; charset=UTF-8",
                                "info": transliterate(nameLibrary.value).replace(/\s+/g, '')
                            }
                        })
                        .then((response) => response.text())
                        .then((responseText) => {
                            if(responseText == "ok") {
                                //alert("Библиотека добавлена")
                                fetch(document.URL + "api/downloadfile", {
                                    method: "GET",
                                headers: {
                                    "Content-type": "application/json; charset=UTF-8",
                                    "info": transliterate(nameLibrary.value).replace(/\s+/g, '')
                                }
                                }).then((response) => response.blob())
                                .then((blob) => {
                                    const url = window.URL.createObjectURL(new Blob([blob]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', transliterate(nameLibrary.value).replace(/\s+/g, '') + `_library.zip`);
                                     // 3. Append to html page
                                     document.body.appendChild(link);
                                     // 4. Force download
                                     link.click();
                                     // 5. Clean up and remove the link
                                     link.parentNode.removeChild(link);
                                })
                                arr.forEach(element => {
                                    var index = arr.indexOf(element);
                                    if (index !== -1) {
                                        arr.splice(index, 1);
                                    }
                                });
                                gen.disabled = false
                                list.replaceChildren()
                            } else {
                                alert("Произошла ошибка")
                                arr.forEach(element => {
                                    var index = arr.indexOf(element);
                                    if (index !== -1) {
                                        arr.splice(index, 1);
                                    }
                                });
                                gen.disabled = false
                                list.replaceChildren()
                            }
                            console.log(responseText)
                            waiting = false
                        });
                        }
                    } else {
                        alert("FAIL: CHANGE LIBRARY NAME")
                        gen.disabled = false
                        waiting = false
                    }
                })
        }
    } else {
        if(nameLibrary.value == '') {
            alert("Название библиотеки не может быть пустым")
        } else {
            alert("Список комнат пуст")
        }
    }
})