const navButton = document.getElementsByClassName('toggle-button')[0]
const navLinks = document.getElementsByClassName('nav-links')[0]
const aboutNavLinks = document.getElementsByClassName('about-nav-links')[0]

navButton.addEventListener('click', () =>{
    navLinks.classList.toggle('active')
    aboutNavLinks.classList.toggle('active')

})

