const classTemplate = document.querySelector("[data-classes-template]");
const classCardContainer = document.querySelector("[data-classes-container]");
const searchInput = document.querySelector("[data-search]");
let classes = []

searchInput.addEventListener("input", e => {
    const value = e.target.value.toLowerCase()
    classes.forEach(c =>{
        const isVisible = c.courseNumber.toLowerCase().includes(value) || c.prof.toLowerCase().includes(value)
        c.element.classList.toggle("hide", !isVisible)
    })
})


fetch('http://localhost:3000/classesjson')
    .then(res => res.json())
    .then(data =>{
        classes = data.map(c => {

            console.log(c)
            const card = classTemplate.content.cloneNode(true).children[0];

            const header = card.querySelector("[data-number]");
            const body = card.querySelector("[data-body]");
            header.textContent = c.courseNumber;
            body.textContent = "Prof: " + c.prof + ", Days: " + c.days + ", Time: " + c.time
            classCardContainer.append(card);
            return {courseNumber: c.courseNumber, prof: c.prof, element: card}
            })
   });