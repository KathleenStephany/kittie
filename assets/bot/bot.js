const form = document.getElementById('bot-form');
const output = document.getElementById('bot-output');
const fragments = [
  ['resonancia', 'pixel', 'latido'],
  ['fluye', 'recuerda', 'respira'],
  ['en la noche', 'desde el glitch', 'en modo debug'],
];

const randomFrom = (array) => array[Math.floor(Math.random() * array.length)];

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = new FormData(form).get('entrada')?.toString().trim();
  if (!value) return;

  const versos = [
    `${value} ${randomFrom(fragments[0])}`,
    `${randomFrom(fragments[1])} ${randomFrom(fragments[2])}`,
    `presiona start y ${randomFrom(['continúa', 'reinicia', 'recarga'])}`,
  ];

  output.innerHTML = versos.map((verso) => `<span>${verso}</span>`).join('');
  form.reset();
});
