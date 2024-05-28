let token = '';

document.getElementById('registerForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) throw new Error('Registration failed');
    alert('Registration successful');
  } catch (error) {
    console.error(error);
  }
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error('Login failed');
    token = data.token;
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('bmiForm').style.display = 'block';
    loadHistory();
  } catch (error) {
    console.error(error);
  }
});

document.getElementById('bmiForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value) / 100;

  if (isNaN(weight) || isNaN(height)) {
    alert('Please enter valid numbers');
    return;
  }

  const bmi = (weight / (height * height)).toFixed(2);
  let category;
  let resultMessage = `Your BMI is ${bmi}. `;
  let resultClass = 'bg-green-200';

  if (bmi < 18.5) {
    category = 'Underweight';
    resultMessage += 'You are underweight. It is recommended to have a balanced diet and consult a nutritionist.';
    resultClass = 'bg-yellow-200';
  } else if (bmi >= 18.5 && bmi < 24.9) {
    category = 'Normal';
    resultMessage += 'You have a normal weight. Keep maintaining your healthy lifestyle!';
  } else if (bmi >= 25 && bmi < 29.9) {
    category = 'Overweight';
    resultMessage += 'You are overweight. Consider regular exercise and a balanced diet.';
    resultClass = 'bg-orange-200';
  } else {
    category = 'Obese';
    resultMessage += 'You are obese. It is advisable to consult a healthcare provider for guidance.';
    resultClass = 'bg-red-200';
  }

  const resultDiv = document.getElementById('result');
  resultDiv.innerText = resultMessage;
  resultDiv.className = `${resultClass} p-4 rounded-md`;

  try {
    const response = await fetch('/api/bmi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ weight, height, bmi, category })
    });

    if (!response.ok) throw new Error('Failed to save BMI');
    loadHistory();
  } catch (error) {
    console.error(error);
  }
});

async function loadHistory() {
  try {
    const response = await fetch('/api/bmi', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to load history');
    
    const history = await response.json();
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '';

    history.forEach(entry => {
      const entryDiv = document.createElement('div');
      entryDiv.className = 'bg-gray-100 p-2 rounded-md my-2 flex justify-between items-center';
      entryDiv.innerHTML = `
        <span>Weight: ${entry.weight} kg, Height: ${entry.height * 100} cm, BMI: ${entry.bmi} (${entry.category})</span>
        <span>
          <button class="bg-blue-500 text-white px-2 py-1 rounded-md mr-2" onclick="editEntry(${entry.id})">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded-md" onclick="deleteEntry(${entry.id})">Delete</button>
        </span>
      `;
      historyDiv.appendChild(entryDiv);
    });
  } catch (error) {
    console.error(error);
  }
}

async function editEntry(id) {
  const weight = prompt('Enter new weight (kg):');
  const height = prompt('Enter new height (cm):');

  if (!weight || !height) return;

  const heightInMeters = parseFloat(height) / 100;
  const bmi = (parseFloat(weight) / (heightInMeters * heightInMeters)).toFixed(2);
  let category;
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi >= 18.5 && bmi < 24.9) category = 'Normal';
  else if (bmi >= 25 && bmi < 29.9) category = 'Overweight';
  else category = 'Obese';

  try {
    const response = await fetch(`/api/bmi/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ weight: parseFloat(weight), height: heightInMeters, bmi, category })
    });

    if (!response.ok) throw new Error('Failed to edit BMI');
    loadHistory();
  } catch (error) {
    console.error(error);
  }
}

async function deleteEntry(id) {
  try {
    const response = await fetch(`/api/bmi/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to delete BMI');
    loadHistory();
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', loadHistory);
