const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/surveys.json');

// Andmete lugemine
const getSurveys = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Kui faili pole või on tühi, tagastame tühja objekti
    return { surveys: [], responses: [] };
  }
};

// Andmete salvestamine
const saveSurveys = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
};

// Avaleht
router.get('/', (req, res) => {
  const data = getSurveys();
  res.render('index', { surveys: data.surveys });
});

// Küsimustiku loomise leht
router.get('/create', (req, res) => {
  res.render('create-survey');
});

// Küsimustiku salvestamine
router.post('/create', (req, res) => {
  try {
    console.log('Create request received');
    console.log('Request body:', req.body);

    const data = getSurveys();
    const { title, description, questions } = req.body;

    console.log('Parsing questions:', questions);
    const parsedQuestions = JSON.parse(questions);
    console.log('Parsed questions:', parsedQuestions);

    const newSurvey = {
      id: uuidv4(),
      title,
      description,
      questions: parsedQuestions,
      createdAt: new Date().toISOString()
    };

    console.log('New survey object:', newSurvey);

    data.surveys.push(newSurvey);
    saveSurveys(data);

    console.log('Survey successfully created with ID:', newSurvey.id);
    res.status(200).json({ success: true, surveyId: newSurvey.id });
  } catch (error) {
    console.error('Error saving survey:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Küsimustiku vaatamine/vastamine
router.get('/survey/:id', (req, res) => {
  const data = getSurveys();
  const survey = data.surveys.find(s => s.id === req.params.id);

  if (!survey) {
    return res.status(404).send('Küsimustikku ei leitud');
  }

  res.render('survey', { survey });
});

// Vastuste salvestamine
router.post('/survey/:id/submit', (req, res) => {
  try {
    console.log('Submitting response for survey ID:', req.params.id);
    console.log('Response data:', req.body);

    const data = getSurveys();
    const survey = data.surveys.find(s => s.id === req.params.id);

    if (!survey) {
      console.log('Survey not found with ID:', req.params.id);
      return res.status(404).send('Küsimustikku ei leitud');
    }

    const response = {
      id: uuidv4(),
      surveyId: req.params.id,
      answers: req.body.answers || {},
      submittedAt: new Date().toISOString()
    };

    console.log('Saving response:', response);

    data.responses.push(response);
    saveSurveys(data);

    console.log('Response successfully saved');
    res.redirect(`/survey/${req.params.id}/thanks`);
  } catch (error) {
    console.error('Error saving response:', error);
    console.error('Error stack:', error.stack);
    res.status(500).send('Viga vastuse salvestamisel. Palun proovige uuesti.');
  }
});

// Tänuleht
router.get('/survey/:id/thanks', (_, res) => {
  res.render('thanks');
});

// Tulemuste vaatamine
router.get('/survey/:id/results', (req, res) => {
  const data = getSurveys();
  const survey = data.surveys.find(s => s.id === req.params.id);
  const responses = data.responses.filter(r => r.surveyId === req.params.id);

  if (!survey) {
    return res.status(404).send('Küsimustikku ei leitud');
  }

  res.render('results', { survey, responses });
});

// Küsimustiku muutmise leht
router.get('/survey/:id/edit', (req, res) => {
  const data = getSurveys();
  const survey = data.surveys.find(s => s.id === req.params.id);

  if (!survey) {
    return res.status(404).send('Küsimustikku ei leitud');
  }

  res.render('edit-survey', { survey });
});

// Küsimustiku uuendamine
router.post('/survey/:id/update', (req, res) => {
  try {
    console.log('Update request received for survey ID:', req.params.id);
    console.log('Request body:', req.body);

    const data = getSurveys();
    const { title, description, questions } = req.body;
    const surveyIndex = data.surveys.findIndex(s => s.id === req.params.id);

    console.log('Survey index in data:', surveyIndex);

    if (surveyIndex === -1) {
      console.log('Survey not found with ID:', req.params.id);
      return res.status(404).json({ success: false, error: 'Küsimustikku ei leitud' });
    }

    // Uuendame küsimustiku andmed
    const parsedQuestions = JSON.parse(questions);
    console.log('Parsed questions:', parsedQuestions);

    data.surveys[surveyIndex] = {
      ...data.surveys[surveyIndex],
      title,
      description,
      questions: parsedQuestions,
      updatedAt: new Date().toISOString()
    };

    console.log('Updated survey object:', data.surveys[surveyIndex]);

    saveSurveys(data);

    console.log('Survey successfully updated');
    res.status(200).json({ success: true, surveyId: req.params.id });
  } catch (error) {
    console.error('Error updating survey:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;