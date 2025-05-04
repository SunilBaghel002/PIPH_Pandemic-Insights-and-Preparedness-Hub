document.addEventListener('DOMContentLoaded', () => {
    // Navigation functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-links a');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    navLinkItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Highlight active nav item based on scroll position
    window.addEventListener('scroll', highlightNavOnScroll);

    function highlightNavOnScroll() {
        const scrollPosition = window.scrollY;

        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Safety tabs functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabs = document.querySelectorAll('.tab');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Modal functionality
    const modal = document.getElementById('detailsModal');
    const closeModal = document.querySelector('.close-modal');

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Helper for scrolling to sections
    window.scrollToSection = function (sectionId) {
        const section = document.getElementById(sectionId);
        const offsetTop = section.offsetTop;

        window.scrollTo({
            top: offsetTop - 70,
            behavior: 'smooth'
        });
    };
});

// Disaster details data
const disasterData = {
    covid19: {
        name: "COVID-19",
        description: "COVID-19 is a respiratory disease caused by the SARS-CoV-2 virus. It was first identified in December 2019 in Wuhan, China, and has since spread globally, leading to the ongoing pandemic.",
        symptoms: [
            "Fever or chills",
            "Cough",
            "Shortness of breath or difficulty breathing",
            "Fatigue",
            "Muscle or body aches",
            "Headache",
            "New loss of taste or smell",
            "Sore throat",
            "Congestion or runny nose",
            "Nausea or vomiting",
            "Diarrhea"
        ],
        prevention: [
            "Get vaccinated when available",
            "Wear a mask in crowded, indoor settings",
            "Maintain at least 6 feet distance from others",
            "Wash hands frequently with soap and water",
            "Use hand sanitizer with at least 60% alcohol",
            "Avoid touching your face",
            "Cover coughs and sneezes",
            "Clean and disinfect frequently touched surfaces",
            "Monitor your health daily"
        ],
        emergency: "Seek emergency medical care if you experience trouble breathing, persistent chest pain or pressure, confusion, inability to wake or stay awake, or bluish lips or face."
    },
    flu: {
        name: "Influenza (Flu)",
        description: "Influenza is a contagious respiratory illness caused by influenza viruses that infect the nose, throat, and sometimes the lungs. It can cause mild to severe illness, and at times can lead to death.",
        symptoms: [
            "Fever or feeling feverish/chills",
            "Cough",
            "Sore throat",
            "Runny or stuffy nose",
            "Muscle or body aches",
            "Headaches",
            "Fatigue (tiredness)",
            "Some people may have vomiting and diarrhea"
        ],
        prevention: [
            "Get a yearly flu vaccine",
            "Avoid close contact with sick people",
            "Cover your nose and mouth when coughing or sneezing",
            "Wash hands frequently with soap and water",
            "Avoid touching your eyes, nose, and mouth",
            "Clean and disinfect surfaces that may be contaminated"
        ],
        emergency: "Seek emergency medical care if you experience difficulty breathing, persistent chest pain, confusion, severe muscle pain, or seizures."
    },
    earthquake: {
        name: "Earthquake",
        description: "An earthquake is a sudden, rapid shaking of the ground caused by the shifting of rocks deep underneath the earth's surface. Earthquakes can happen without warning and can result in injuries and extensive damage to property and infrastructure.",
        symptoms: ["Not applicable"],
        prevention: [
            "Identify safe places in each room of your home",
            "Practice drop, cover, and hold on drills",
            "Secure heavy furniture and appliances",
            "Store breakable items in low, closed cabinets",
            "Learn how to shut off utilities",
            "Have emergency supplies ready",
            "Create a family emergency communication plan"
        ],
        emergency: "During an earthquake: Drop, cover, and hold on. If indoors, stay there until the shaking stops. If outdoors, find a clear spot away from buildings, trees, and power lines."
    },
    flood: {
        name: "Flood",
        description: "Flooding is an overflow of water that submerges land that is usually dry. Floods occur when water overflows or inundates land that's normally dry. This can happen in a variety of ways, including excessive rainfall, rapid snowmelt, or failure of dams.",
        symptoms: ["Not applicable"],
        prevention: [
            "Know your area's flood risk",
            "Consider flood insurance",
            "Elevate electrical systems and appliances",
            "Install check valves in plumbing",
            "Construct barriers to prevent water",
            "Seal basement walls with waterproofing compounds",
            "Prepare an evacuation plan and emergency kit"
        ],
        emergency: "Move to higher ground immediately if there is a flood warning. Never walk, swim, or drive through flood waters. Just six inches of moving water can knock you down, and one foot of moving water can sweep your vehicle away."
    },
    hurricane: {
        name: "Hurricane",
        description: "Hurricanes are massive storm systems that form over warm ocean waters and move toward land. They can cause catastrophic damage from heavy rainfall, high winds, and storm surges (rising ocean levels).",
        symptoms: ["Not applicable"],
        prevention: [
            "Make an emergency plan",
            "Build an emergency kit",
            "Know your evacuation zone",
            "Strengthen your home (secure roof, trim trees, etc.)",
            "Purchase flood insurance",
            "Stock up on supplies before a storm warning",
            "Keep important documents in a waterproof container"
        ],
        emergency: "If ordered to evacuate, do so immediately. Stay informed about weather conditions. If not evacuating, stay indoors away from windows and keep a supply of food and water."
    },
    wildfire: {
        name: "Wildfire",
        description: "A wildfire is an uncontrolled fire that burns in wildland vegetation, often in rural areas. Wildfires can burn in forests, grasslands, savannas, and other ecosystems, and have been doing so for hundreds of millions of years.",
        symptoms: ["Not applicable"],
        prevention: [
            "Create defensible space around your home",
            "Use fire-resistant materials for home construction",
            "Keep gutters clean",
            "Keep flammable materials away from your house",
            "Have an evacuation plan",
            "Prepare an emergency kit",
            "Know multiple evacuation routes"
        ],
        emergency: "If ordered to evacuate, do so immediately. If trapped, call 911. Keep doors and windows closed but unlocked. Fill sinks and tubs with water."
    }
};

// Symptom checker data
const diseaseSymptomsMap = {
    "covid19": ["fever", "cough", "shortness_of_breath", "fatigue", "body_aches", "headache", "loss_of_taste", "sore_throat"],
    "flu": ["fever", "cough", "sore_throat", "body_aches", "headache", "fatigue"],
    "common_cold": ["cough", "sore_throat", "fatigue", "headache"],
    "allergies": ["cough", "shortness_of_breath", "headache"],
    "heatstroke": ["headache", "confusion", "body_aches"]
};

// Function to show disaster details in modal
window.showDetails = function (disasterId) {
    const data = disasterData[disasterId];
    if (!data) return;

    const modalBody = document.getElementById('modalBody');

    let content = `
<h2>${data.name}</h2>
<div class="modal-section">
<p>${data.description}</p>
</div>
`;

    if (data.symptoms[0] !== "Not applicable") {
        content += `
<div class="modal-section">
<h3>Common Symptoms</h3>
<ul class="symptom-list">
  ${data.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
</ul>
</div>
`;
    }

    content += `
<div class="modal-section">
<h3>Prevention & Safety</h3>
<ul class="prevention-list">
${data.prevention.map(prevention => `<li>${prevention}</li>`).join('')}
</ul>
</div>
<div class="modal-section">
<h3>Emergency Situations</h3>
<p>${data.emergency}</p>
</div>
`;

    modalBody.innerHTML = content;
    document.getElementById('detailsModal').style.display = 'block';
};

// New Symptom Checker Functionality
const userSymptoms = {
    feeling: '',
    mainSymptom: '',
    respiratoryDetail: '',
    digestiveDetail: '',
    neurologicalDetail: '',
    skinDetail: '',
    painDetail: '',
    feverDetail: '',
    duration: '',
    severity: ''
};

// Function for symptom checker option selection
window.selectOption = function (questionNum, category, value) {
    userSymptoms[category] = value;

    const currentQuestionContainer = document.querySelector('.question-container.active');
    currentQuestionContainer.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    event.target.classList.add('selected');

    setTimeout(() => {
        currentQuestionContainer.classList.remove('active');

        if (questionNum === 1) {
            if (value === 'Emergency') {
                showEmergencyResults();
                return;
            }
            document.getElementById('question-2').classList.add('active');
        }
        else if (questionNum === 2) {
            if (value === 'Respiratory') {
                document.getElementById('question-respiratory').classList.add('active');
            } else if (value === 'Digestive') {
                document.getElementById('question-digestive').classList.add('active');
            } else {
                document.getElementById('question-duration').classList.add('active');
            }
        }
        else if (questionNum === 3) {
            document.getElementById('question-duration').classList.add('active');
        }
        else if (questionNum === 4) {
            document.getElementById('question-severity').classList.add('active');
        }
        else if (questionNum === 5) {
            showSymptomResults();
        }
    }, 300);
};

function showEmergencyResults() {
    document.getElementById('question-results').classList.add('active');

    const resultsContent = document.getElementById('symptom-results-content');
    resultsContent.innerHTML = `
<div class="emergency-message">
<h5><i class="fas fa-exclamation-triangle"></i> Emergency Medical Attention Needed</h5>
<p>Based on your selection, you may need immediate medical attention.</p>
<p><strong>Please call emergency services (911) or go to the nearest emergency room immediately.</strong></p>
</div>
`;

    const recommendationsContent = document.getElementById('treatment-recommendations');
    recommendationsContent.innerHTML = `
<h5>While Waiting for Emergency Services:</h5>
<ul>
<li>Remain calm and find a safe, comfortable position</li>
<li>Have someone stay with you if possible</li>
<li>Do not eat or drink anything unless instructed by medical professionals</li>
<li>Gather information about any medications you're taking to share with emergency responders</li>
</ul>
<p class="disclaimer">This is not a substitute for professional medical advice, diagnosis, or treatment.</p>
`;
}

function showSymptomResults() {
    document.getElementById('question-results').classList.add('active');

    const resultsContent = document.getElementById('symptom-results-content');
    resultsContent.innerHTML = `
<h5>Based on your responses:</h5>
<div class="result-item">
<span class="result-label">Overall feeling:</span> ${userSymptoms.feeling}
</div>
<div class="result-item">
<span class="result-label">Main symptom category:</span> ${userSymptoms.mainSymptom} issues
</div>`;

    if (userSymptoms.respiratoryDetail) {
        resultsContent.innerHTML += `
<div class="result-item">
<span class="result-label">Respiratory detail:</span> ${userSymptoms.respiratoryDetail}
</div>`;
    }

    if (userSymptoms.digestiveDetail) {
        resultsContent.innerHTML += `
<div class="result-item">
<span class="result-label">Digestive detail:</span> ${userSymptoms.digestiveDetail}
</div>`;
    }

    resultsContent.innerHTML += `
<div class="result-item">
<span class="result-label">Duration:</span> ${userSymptoms.duration}
</div>
<div class="result-item">
<span class="result-label">Severity:</span> ${userSymptoms.severity}
</div>`;

    generateTreatmentRecommendations();
}

function generateTreatmentRecommendations() {
    const recommendationsContent = document.getElementById('treatment-recommendations');
    let recommendations = `<h5>Recommendations for Your Symptoms:</h5><ul>`;

    recommendations += `<li>Rest and get plenty of fluids</li>`;

    if (userSymptoms.mainSymptom === 'Respiratory') {
        recommendations += `
<li>Use a humidifier or take steamy showers to ease congestion</li>
<li>Consider over-the-counter decongestants if appropriate</li>`;

        if (userSymptoms.respiratoryDetail === 'Dry cough') {
            recommendations += `<li>Try honey and lemon in warm water to soothe your throat</li>`;
        } else if (userSymptoms.respiratoryDetail === 'Shortness of breath') {
            recommendations += `<li>Practice deep breathing techniques in a comfortable position</li>
<li>Avoid exertion and keep windows open for fresh air</li>`;
        }
    }

    else if (userSymptoms.mainSymptom === 'Digestive') {
        recommendations += `
<li>Follow the BRAT diet (Bananas, Rice, Applesauce, Toast) temporarily</li>
<li>Avoid spicy, greasy foods, caffeine, and alcohol</li>`;

        if (userSymptoms.digestiveDetail === 'Diarrhea') {
            recommendations += `<li>Stay hydrated with water and electrolyte solutions</li>`;
        } else if (userSymptoms.digestiveDetail === 'Nausea') {
            recommendations += `<li>Try ginger tea or peppermint to calm your stomach</li>`;
        }
    }

    else if (userSymptoms.mainSymptom === 'Fever') {
        recommendations += `
<li>Take acetaminophen or ibuprofen as directed to reduce fever</li>
<li>Use lightweight clothing and bedding</li>
<li>Apply cool, damp cloths to your forehead and wrists</li>`;
    }

    if (userSymptoms.severity === 'Severe') {
        recommendations += `<li>Consider consulting with a healthcare professional soon</li>`;
    }

    if (userSymptoms.duration === 'Week+') {
        recommendations += `<li>Your symptoms have persisted for some time. Medical evaluation is recommended.</li>`;
    }

    recommendations += `</ul>
<p class="disclaimer">This is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a healthcare professional about your symptoms.</p>`;

    recommendationsContent.innerHTML = recommendations;
}

// Function to reset the symptom checker
window.resetSymptomChecker = function () {
    for (let key in userSymptoms) {
        userSymptoms[key] = '';
    }

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    document.querySelectorAll('.question-container').forEach(container => {
        container.classList.remove('active');
    });

    document.getElementById('question-1').classList.add('active');
};

// Function to check symptoms (legacy function)
window.checkSymptoms = function () {
    const checkedSymptoms = Array.from(document.querySelectorAll('input[name="symptom"]:checked')).map(input => input.value);
    const resultsContainer = document.querySelector('.results-container');
    const noSymptomsMessage = document.querySelector('.no-symptoms');

    if (checkedSymptoms.length === 0) {
        noSymptomsMessage.style.display = 'block';
        resultsContainer.innerHTML = '';
        return;
    }

    noSymptomsMessage.style.display = 'none';
    resultsContainer.innerHTML = '';

    const matches = {};

    for (const [disease, symptoms] of Object.entries(diseaseSymptomsMap)) {
        const matchingSymptoms = symptoms.filter(symptom => checkedSymptoms.includes(symptom));
        if (matchingSymptoms.length > 0) {
            matches[disease] = {
                count: matchingSymptoms.length,
                percentage: Math.round((matchingSymptoms.length / symptoms.length) * 100)
            };
        }
    }

    const sortedMatches = Object.entries(matches)
        .sort((a, b) => b[1].percentage - a[1].percentage)
        .filter(match => match[1].percentage >= 30);

    if (sortedMatches.length === 0) {
        resultsContainer.innerHTML = '<p>No significant matches found. Your symptoms may be related to other conditions.</p>';
        return;
    }

    const diseaseNames = {
        "covid19": "COVID-19",
        "flu": "Influenza (Flu)",
        "common_cold": "Common Cold",
        "allergies": "Seasonal Allergies",
        "heatstroke": "Heat-Related Illness"
    };

    sortedMatches.forEach(([disease, matchData]) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        resultItem.innerHTML = `
<div class="result-name">${diseaseNames[disease]}</div>
<div class="result-percentage">Match: ${matchData.percentage}%</div>
<div class="result-description">
Your symptoms match ${matchData.count} of the common symptoms for ${diseaseNames[disease]}.
</div>
${disease === 'covid19' || disease === 'flu' ?
                `<div class="result-action">Please consult a healthcare professional.</div>` :
                `<div class="result-action">Monitor your symptoms and rest.</div>`}
`;

        resultsContainer.appendChild(resultItem);
    });
};

// New Awareness Section Functionality
let currentAwarenessSlide = 1;
const totalAwarenessSlides = 4;

window.changeAwarenessSlide = function (direction) {
    document.querySelector(`.awareness-slide[data-slide="${currentAwarenessSlide}"]`).classList.remove('active');
    document.querySelector(`.pagination-indicators .indicator[data-slide="${currentAwarenessSlide}"]`).classList.remove('active');

    if (direction === 'next') {
        currentAwarenessSlide = currentAwarenessSlide < totalAwarenessSlides ? currentAwarenessSlide + 1 : 1;
    } else {
        currentAwarenessSlide = currentAwarenessSlide > 1 ? currentAwarenessSlide - 1 : totalAwarenessSlides;
    }

    document.querySelector(`.awareness-slide[data-slide="${currentAwarenessSlide}"]`).classList.add('active');
    document.querySelector(`.pagination-indicators .indicator[data-slide="${currentAwarenessSlide}"]`).classList.add('active');
};

window.goToAwarenessSlide = function (slideNumber) {
    document.querySelector(`.awareness-slide[data-slide="${currentAwarenessSlide}"]`).classList.remove('active');
    document.querySelector(`.pagination-indicators .indicator[data-slide="${currentAwarenessSlide}"]`).classList.remove('active');

    currentAwarenessSlide = slideNumber;

    document.querySelector(`.awareness-slide[data-slide="${currentAwarenessSlide}"]`).classList.add('active');
    document.querySelector(`.pagination-indicators .indicator[data-slide="${currentAwarenessSlide}"]`).classList.add('active');
};

// Mock data for alerts
const mockAlerts = {
    "New York": [
        {
            type: "pandemic",
            title: "COVID-19 Community Transmission",
            date: "2025-04-01",
            message: "Medium level of COVID-19 community transmission in your area. Mask use recommended for high-risk individuals."
        },
        {
            type: "weather",
            title: "Heat Advisory",
            date: "2025-04-05",
            message: "Heat advisory in effect from 12 PM to 8 PM. Temperatures expected to reach 95°F. Stay hydrated and limit outdoor activities."
        }
    ],
    "Los Angeles": [
        {
            type: "geological",
            title: "Earthquake Preparedness",
            date: "2025-04-03",
            message: "Recent seismic activity detected. Review your earthquake safety plan and check emergency supplies."
        },
        {
            type: "weather",
            title: "Wildfire Risk",
            date: "2025-04-04",
            message: "High wildfire risk due to dry conditions and strong winds. Avoid activities that could cause sparks."
        },
        {
            type: "pandemic",
            title: "Influenza Outbreak",
            date: "2025-03-30",
            message: "Seasonal influenza cases rising above expected levels. Vaccination recommended."
        }
    ],
    "Miami": [
        {
            type: "weather",
            title: "Hurricane Watch",
            date: "2025-04-02",
            message: "Hurricane watch in effect. Potential for tropical storm conditions within 48 hours. Review evacuation plans."
        },
        {
            type: "pandemic",
            title: "Dengue Fever Alert",
            date: "2025-03-29",
            message: "Increased cases of dengue fever reported. Use insect repellent and eliminate standing water around homes."
        }
    ],
    "Chicago": [
        {
            type: "weather",
            title: "Flood Warning",
            date: "2025-04-04",
            message: "Flood warning for areas near Chicago River. Move to higher ground if in flood-prone areas."
        },
        {
            type: "pandemic",
            title: "COVID-19 Update",
            date: "2025-04-01",
            message: "New COVID-19 variant detected in the community. Increased testing recommended for symptomatic individuals."
        }
    ],
    "Phoenix": [
        {
            type: "weather",
            title: "Excessive Heat Warning",
            date: "2025-04-05",
            message: "Dangerous heat conditions expected. Temperatures may reach 110°F. Check on vulnerable individuals and stay hydrated."
        }
    ]
};

// Function to get alerts based on location
window.getAlerts = function () {
    const location = document.getElementById('location').value.trim();
    const alertsList = document.getElementById('alertsList');

    if (!location) {
        alertsList.innerHTML = '<p class="alert-message">Please enter your location</p>';
        return;
    }

    const cityMatches = Object.keys(mockAlerts).filter(city =>
        city.toLowerCase().includes(location.toLowerCase())
    );

    if (cityMatches.length === 0) {
        alertsList.innerHTML = '<p class="alert-message">No alerts found for this location. Try a different city.</p>';
        return;
    }

    const cityAlerts = mockAlerts[cityMatches[0]];
    if (!cityAlerts || cityAlerts.length === 0) {
        alertsList.innerHTML = '<p class="alert-message">No current alerts for this location</p>';
        return;
    }

    alertsList.innerHTML = '';
    cityAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item ${alert.type}`;

        const alertDate = new Date(alert.date);
        const formattedDate = alertDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        alertItem.innerHTML = `
<div class="alert-title">
<span>${alert.title}</span>
<span class="alert-date">${formattedDate}</span>
</div>
<p>${alert.message}</p>
`;

        alertsList.appendChild(alertItem);
    });
};

// Function to filter alerts by type
window.filterAlerts = function () {
    const filterValue = document.getElementById('alertFilter').value;
    const alertItems = document.querySelectorAll('.alert-item');

    if (!alertItems.length) return;

    alertItems.forEach(item => {
        if (filterValue === 'all' || item.classList.contains(filterValue)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
};

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    const currentYear = new Date().getFullYear();
    document.querySelector('.footer-bottom p').innerHTML = `&copy; ${currentYear} SafeGuard. All rights reserved. For educational purposes only.`;

    resetSymptomChecker();
});
