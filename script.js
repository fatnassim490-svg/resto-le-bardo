/* ==========================================================================
   Le Bardo — script.js
   JS vanilla : menu burger mobile, onglets de la carte, validation du
   formulaire de réservation.
   ========================================================================== */

/**
 * Ouvre/ferme le menu mobile (burger) et anime les 3 barres en croix.
 * Appelée au clic sur le bouton #burger-btn (présent sur toutes les pages).
 */
function initBurgerMenu() {
  const burgerBtn = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('menu-mobile');
  if (!burgerBtn || !mobileMenu) return;

  burgerBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    burgerBtn.classList.toggle('open');
  });
}

/**
 * Gère le système d'onglets de la page "La Carte" (Entrées / Plats /
 * Desserts / Boissons). Affiche le panneau correspondant à l'onglet cliqué.
 */
function initMenuTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  if (tabButtons.length === 0) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabButtons.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
}

/**
 * Valide un champ requis : vérifie qu'il n'est pas vide et affiche/efface
 * le message d'erreur associé.
 */
function validateRequiredField(input, errorEl, message) {
  if (!input.value.trim()) {
    input.classList.add('error');
    errorEl.textContent = message;
    return false;
  }
  input.classList.remove('error');
  errorEl.textContent = '';
  return true;
}

/**
 * Valide le format d'un numéro de téléphone (chiffres, espaces, +, entre
 * 8 et 15 caractères utiles).
 */
function validatePhoneField(input, errorEl) {
  const phonePattern = /^[0-9+\s]{8,15}$/;
  if (!phonePattern.test(input.value.trim())) {
    input.classList.add('error');
    errorEl.textContent = 'Veuillez entrer un numéro de téléphone valide.';
    return false;
  }
  input.classList.remove('error');
  errorEl.textContent = '';
  return true;
}

/**
 * Valide le format d'une adresse email.
 */
function validateEmailField(input, errorEl) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(input.value.trim())) {
    input.classList.add('error');
    errorEl.textContent = 'Veuillez entrer une adresse email valide.';
    return false;
  }
  input.classList.remove('error');
  errorEl.textContent = '';
  return true;
}

/**
 * Valide le bloc de contact (téléphone / email) : au moins un des deux
 * champs doit être renseigné, et s'il est renseigné, son format doit être
 * valide. Les deux champs ne sont plus individuellement obligatoires.
 */
function validateContactFields(telephone, email, errTelephone, errEmail, errContact) {
  const telephoneRempli = telephone.value.trim() !== '';
  const emailRempli = email.value.trim() !== '';

  // Réinitialiser les erreurs
  telephone.classList.remove('error');
  email.classList.remove('error');
  errTelephone.textContent = '';
  errEmail.textContent = '';
  errContact.textContent = '';

  if (!telephoneRempli && !emailRempli) {
    telephone.classList.add('error');
    email.classList.add('error');
    errContact.textContent = 'Merci de renseigner au moins un moyen de contact (e-mail ou téléphone).';
    return false;
  }

  let isValid = true;
  if (telephoneRempli) {
    isValid = validatePhoneField(telephone, errTelephone) && isValid;
  }
  if (emailRempli) {
    isValid = validateEmailField(email, errEmail) && isValid;
  }

  return isValid;
}

/**
 * Initialise la validation du formulaire de réservation de la page
 * "Réserver & Contact". Empêche l'envoi tant que les champs requis ne sont
 * pas valides et affiche un message de confirmation simulé.
 */
function initReservationForm() {
  const form = document.getElementById('reservation-form');
  if (!form) return;

  const confirmationBox = document.getElementById('form-confirmation');
  const submitBtn = form.querySelector('button[type="submit"]');
  const errEnvoi = document.getElementById('err-envoi');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nom = document.getElementById('nom');
    const telephone = document.getElementById('telephone');
    const email = document.getElementById('email');
    const date = document.getElementById('date');
    const heure = document.getElementById('heure');
    const convives = document.getElementById('convives');

    let isValid = true;
    isValid = validateRequiredField(nom, document.getElementById('err-nom'), 'Merci d\'indiquer votre nom complet.') && isValid;
    isValid = validateContactFields(
      telephone,
      email,
      document.getElementById('err-telephone'),
      document.getElementById('err-email'),
      document.getElementById('err-contact')
    ) && isValid;
    isValid = validateRequiredField(date, document.getElementById('err-date'), 'Merci de choisir une date.') && isValid;
    isValid = validateRequiredField(heure, document.getElementById('err-heure'), 'Merci de choisir un créneau.') && isValid;
    isValid = validateRequiredField(convives, document.getElementById('err-convives'), 'Merci d\'indiquer le nombre de convives.') && isValid;

    if (!isValid) return;

    if (errEnvoi) errEnvoi.textContent = '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        form.classList.add('hidden');
        confirmationBox.classList.remove('hidden');
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (err) {
      if (errEnvoi) {
        errEnvoi.textContent = 'Une erreur est survenue lors de l\'envoi. Merci de réessayer ou de nous appeler directement.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmer la réservation';
      }
    }
  });
}

/**
 * Empêche la sélection d'une date passée dans le champ #date du formulaire
 * de réservation, en fixant son attribut `min` sur la date du jour.
 */
function initMinReservationDate() {
  const dateInput = document.getElementById('date');
  if (!dateInput) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
}

document.addEventListener('DOMContentLoaded', () => {
  initBurgerMenu();
  initMenuTabs();
  initReservationForm();
  initMinReservationDate();
});
