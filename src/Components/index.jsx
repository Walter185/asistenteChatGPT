// src/VirtualAssistant.js
import React, { useState } from 'react';
import axios from 'axios';
import { OPENAI_API_KEY } from '../Config/Config';

const VirtualAssistant = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const startRecognition = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'es-ES';

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setMessage(text);
      textToSpeech(`Has dicho ${text}`);
      await getChatGPTResponse(text);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setMessage('Error en el reconocimiento de voz.');
    };

    recognition.start();
  };

  const textToSpeech = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'es-ES';
    window.speechSynthesis.speak(speech);
  };

  const getChatGPTResponse = async (text) => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/engines/davinci-codex/completions',
        {
          prompt: text,
          max_tokens: 150,
          n: 1,
          stop: null,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const responseText = response.data.choices[0].text.trim();
      setResponse(responseText);
      textToSpeech(responseText);
    } catch (error) {
      console.error('Error al obtener la respuesta de ChatGPT:', error);
      setResponse('Lo siento, hubo un error al obtener la respuesta.');
      textToSpeech('Lo siento, hubo un error al obtener la respuesta.');
    }
  };

  return (
    <div>
      <h1>Asistente Virtual</h1>
      <button onClick={startRecognition}>Habla</button>
      <p>Mensaje: {message}</p>
      <p>Respuesta: {response}</p>
    </div>
  );
};

export default VirtualAssistant;
