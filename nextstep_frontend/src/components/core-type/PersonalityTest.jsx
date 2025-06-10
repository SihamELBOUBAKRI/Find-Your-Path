import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import '../../assets/styles/PersonalityTest.css';

const PersonalityTest = () => {
  const [categories, setCategories] = useState(['personality', 'interests', 'skills']);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState({
    questions: true,
    submission: false
  });
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const navigate = useNavigate();

  // Fetch questions for current category
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(prev => ({ ...prev, questions: true }));
        const response = await api.get(`/questions?category=${categories[currentCategoryIndex]}`);
        setQuestions(response.data.data || []);
        setCurrentQuestionIndex(0);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading questions');
      } finally {
        setLoading(prev => ({ ...prev, questions: false }));
      }
    };

    fetchQuestions();
  }, [currentCategoryIndex, categories]);

  const handleAnswerSelect = (questionId, weight) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: weight
    }));
    
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  };

  const goToNextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      setCurrentQuestionIndex(questions.length - 1);
    }
  };

  const submitQuiz = async () => {
    try {
      setLoading(prev => ({ ...prev, submission: true }));
      
      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([question_id, weight]) => ({
        question_id: parseInt(question_id),
        weight: parseInt(weight)
      }));

      // Submit to the correct endpoint
      const response = await api.post('/quiz/answers', {
        answers: formattedAnswers
      });

      // Handle the response structure
      if (response.data && response.data.success) {
        setQuizResult(response.data);
        setQuizCompleted(true);
      } else {
        throw new Error(response.data?.message || 'Could not determine personality type');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error submitting quiz');
    } finally {
      setLoading(prev => ({ ...prev, submission: false }));
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading.questions) return <div className="loading">Loading quiz...</div>;
  if (error) return <div className="error">{error}</div>;

  // Destructure the result data
  const personalityData = quizResult?.personality_type;
  const personalityType = personalityData?.personality_type;
  const scoreBreakdown = quizResult?.score_breakdown;

  // Check if all questions in current category are answered
  const currentCategoryQuestions = questions.map(q => q.id);
  const currentCategoryAnswered = currentCategoryQuestions.every(id => answers[id] !== undefined);
  const isLastCategory = currentCategoryIndex === categories.length - 1;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="quiz-container">
      {!quizCompleted ? (
        <>
          <div className="quiz-header">
            <h1>Personality Assessment</h1>
            <div className="category-indicator">
              {categories.map((category, index) => (
                <div 
                  key={category}
                  className={`category-step ${index === currentCategoryIndex ? 'active' : ''} ${index < currentCategoryIndex ? 'completed' : ''}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </div>
              ))}
            </div>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                    backgroundColor: isLastCategory ? '#4CAF50' : '#2196F3'
                  }}
                ></div>
              </div>
              <span className="progress-text">
                Question {currentQuestionIndex + 1} of {questions.length} ({categories[currentCategoryIndex]})
              </span>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="question-card">
              <div className="question-content">
                <h3 className="question-text">
                  {questions[currentQuestionIndex].question}
                </h3>
                
                <div className="answer-scale">
                  <div className="scale-labels">
                    <span>Strongly Disagree</span>
                    <span>Neutral</span>
                    <span>Strongly Agree</span>
                  </div>
                  
                  <div className="answer-options">
                    {[-3, -2, -1, 0, 1, 2, 3].map(weight => (
                      <button
                        key={weight}
                        className={`answer-btn ${answers[questions[currentQuestionIndex].id] === weight ? 'selected' : ''}`}
                        onClick={() => handleAnswerSelect(questions[currentQuestionIndex].id, weight)}
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="navigation-buttons">
                <button 
                  className="nav-btn prev-btn"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0 && currentCategoryIndex === 0}
                >
                  Previous
                </button>
                
                {!isLastQuestion ? (
                  <button 
                    className="nav-btn next-btn"
                    disabled={answers[questions[currentQuestionIndex].id] === undefined}
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    className={`nav-btn ${isLastCategory ? 'submit-btn' : 'next-category-btn'}`}
                    disabled={!currentCategoryAnswered || loading.submission}
                    onClick={goToNextCategory}
                  >
                    {loading.submission ? 'Submitting...' : 
                     isLastCategory ? 'Submit Quiz' : `Next Category (${categories[currentCategoryIndex + 1]})`}
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="results-container">
          <h2>Your Personality Results</h2>
          
          {quizResult?.success ? (
            <>
              <div className="user-info-card">
                <h3>{personalityData.name}</h3>
                <p className="user-email">{personalityData.email}</p>
                <p className="recommended-major">
                  Recommended Major: <strong>{personalityData.recommended_major}</strong>
                </p>
              </div>

              <div className="personality-card">
                <div className="personality-header">
                  <h3 className="personality-name">
                    {personalityType.name}
                  </h3>
                  {personalityType.anime_character_image && (
                    <img 
                      src={personalityType.anime_character_image} 
                      alt={personalityType.name}
                      className="personality-image"
                    />
                  )}
                </div>
                
                <p className="personality-description">
                  {personalityType.description}
                </p>
                
                <div className="traits-section">
                  <h4>Key Traits</h4>
                  <div className="traits-list">
                    {personalityType.traits.map((trait, index) => (
                      <span key={index} className="trait-badge">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="strengths-weaknesses">
                  <div className="strengths">
                    <h4>Strengths</h4>
                    <ul>
                      {personalityType.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="weaknesses">
                    <h4>Weaknesses</h4>
                    <ul>
                      {personalityType.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {scoreBreakdown && (
                <div className="score-breakdown">
                  <h4>Score Breakdown</h4>
                  <div className="score-grid">
                    {Object.entries(scoreBreakdown).map(([typeId, score]) => (
                      <div key={typeId} className="score-item">
                        <span className="score-type">Type {typeId}</span>
                        <span className="score-value">{score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="result-actions">
                <button 
                  className="dashboard-btn"
                  onClick={goToDashboard}
                >
                  Go to Dashboard
                </button>
              </div>
            </>
          ) : (
            <div className="error">
              {quizResult?.message || 'Could not determine your personality type. Please try again.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalityTest;