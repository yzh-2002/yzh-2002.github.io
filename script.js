const ACTIVE ='active';

const active_video =document.querySelectorAll(
    ".main-structure .content video"
);

const main_header =document.querySelector(
    ".content .text-description h1"
);
const second_header =document.querySelector(
    ".content .text-description h2"
);
const paragraph =document.querySelector(
    ".content .text-description p"
);

const menu_logo =document.querySelector("header .menu-logo");
const main_structure =document.querySelector(".main-structure");
const menu_button =document.querySelectorAll(".aside-menu a")

active_video[0].classList.remove(ACTIVE);
active_video[0].classList.add(ACTIVE);

main_header.innerHTML =CONTENT_INFO.Introduction.h1;
second_header.innerHTML =CONTENT_INFO.Introduction.h2;
paragraph.innerHTML =CONTENT_INFO.Introduction.p;

menu_logo.addEventListener('click',()=>{
    menu_logo.classList.toggle(ACTIVE);
    main_structure.classList.toggle(ACTIVE);
})

menu_button.forEach((button,index)=>{
    button.addEventListener("click",()=>{
        active_video.forEach((video)=>{
            video.classList.remove(ACTIVE);
        })
        active_video[index].classList.add(ACTIVE);
        modify_content(index);
    })
})

function modify_content(index){
    switch(index) {
        case 0:
            main_header.innerHTML =CONTENT_INFO.Introduction.h1;
            second_header.innerHTML =CONTENT_INFO.Introduction.h2;
            paragraph.innerHTML =CONTENT_INFO.Introduction.p;
            break;
        case 1:
            main_header.innerHTML =CONTENT_INFO.Github.h1;
            second_header.innerHTML =CONTENT_INFO.Github.h2;
            paragraph.innerHTML =CONTENT_INFO.Github.p;
            break;
        case 2:
            main_header.innerHTML =CONTENT_INFO.JueJin.h1;
            second_header.innerHTML =CONTENT_INFO.JueJin.h2;
            paragraph.innerHTML =CONTENT_INFO.JueJin.p;
            break;
        case 3:
            main_header.innerHTML =CONTENT_INFO.QQ.h1;
            second_header.innerHTML =CONTENT_INFO.QQ.h2;
            paragraph.innerHTML =CONTENT_INFO.QQ.p;
            break;
        case 4:
            main_header.innerHTML =CONTENT_INFO.Steam.h1;
            second_header.innerHTML =CONTENT_INFO.Steam.h2;
            paragraph.innerHTML =CONTENT_INFO.Steam.p;
            break;
        default:
            break;
    }
}