import AOS from 'aos'
import 'aos/dist/aos.css'
import 'animate.css/animate.min.css'

// تهيئة حركات AOS
export const initAnimations = () => {
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false,
  })
}

// حركات مخصصة للعناصر
export const animations = {
  fadeIn: 'animate__animated animate__fadeIn',
  fadeInUp: 'animate__animated animate__fadeInUp',
  fadeInDown: 'animate__animated animate__fadeInDown',
  fadeInLeft: 'animate__animated animate__fadeInLeft',
  fadeInRight: 'animate__animated animate__fadeInRight',
  zoomIn: 'animate__animated animate__zoomIn',
  bounceIn: 'animate__animated animate__bounceIn',
  pulse: 'animate__animated animate__pulse',
  slideInUp: 'animate__animated animate__slideInUp',
}

// حركات عند التمرير
export const scrollAnimations = {
  fadeUp: 'data-aos="fade-up"',
  fadeDown: 'data-aos="fade-down"',
  fadeLeft: 'data-aos="fade-left"',
  fadeRight: 'data-aos="fade-right"',
  zoomIn: 'data-aos="zoom-in"',
  zoomOut: 'data-aos="zoom-out"',
  flipUp: 'data-aos="flip-up"',
  flipDown: 'data-aos="flip-down"',
}
