import 'flowbite'

/**
 * Function recieved form data and runs form validation before submitting to company email
 *
 * 1. check to see if name field is empty
 *  -- if so, throw alert for required field
 * 2. if not, check to see if email is empty
 *  -- if empty, throw alert for required field
 * 3. check to see if email is a valid email address
 *  -- throw error if not a valid email
 * 4. check to see if message is empty
 *  -- throw alert for required field
 * 5. if all checks pass, throw alert that message was submitted successfully
 */

function validateForm(formData) {
  const errors = {}

  // Name validation
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Name is required'
  }

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email";
  }

  // Message validation
  if (!formData.message) {
    errors.message = 'Message is required'
  }

  return {
    isValid: Object.keys(errors).length === 0, errors
  }
}

function displayErrors(errors) {
  // Clear all previous errors
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = ''
    el.style.display = 'none'
  })

  document.querySelectorAll('.error').forEach(el => {
    el.classList.remove('error')
  })

  // Display new errors
  Object.keys(errors).forEach(fieldName => {
    const errorElement = document.getElementById(`${fieldName}-error`)
    const inputElement = document.getElementById(fieldName)

    if (errorElement) {
      errorElement.textContent = errors[fieldName]
      errorElement.style.display = 'block'
    }

    if (inputElement) {
      inputElement.classList.add('error')
    }
  })
}

// Usage
const form = document.querySelector('#contact-form')

// Initialize EmailJS
emailjs.init({
  publicKey: "bJylpmbDH-5r6ASFa",
})

form.addEventListener('submit', (e) => {
  e.preventDefault()

  const formData = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value
  }

  const validation = validateForm(formData)

  if (validation.isValid) {
// Send email
    emailjs.send("J&S_Contact_Form", "J&S_Contact_Form", {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message
    })
      .then(() => {
        alert("Message sent successfully!");
        form.reset(); // Clear the form
      })
      .catch((error) => {
        alert("Failed to send message. Please try again.");
        console.error(error);
      });
  } else {
    displayErrors(validation.errors);
  }
})

let currentSlide = 0;
const slider = document.getElementById('slider');
const totalSlides = slider.children.length;
let autoSlideInterval;
let isPlaying = true;

function updateSlider() {
  slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateSlider();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateSlider();
}

// Expose to global scope for inline HTML handlers (or when script is a module)
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.resetAutoSlide = resetAutoSlide;
window.toggleAutoSlide = toggleAutoSlide;

function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 3000);
  isPlaying = true;
  updatePauseButton();
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
  isPlaying = false;
  updatePauseButton();
}

function resetAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

function toggleAutoSlide() {
  if (isPlaying) {
    stopAutoSlide();
  } else {
    startAutoSlide();
  }
}

function updatePauseButton() {
  const btn = document.getElementById('pauseBtn');
  btn.textContent = isPlaying ? 'Pause' : 'Play';
}

// Start auto-sliding when page loads
startAutoSlide();