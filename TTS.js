class TTS {
        async function synthesizeSpeech(text) {
            const credentials = {
                username: 'TTS0421_70789634',
                password: 'Api042170789634',
                rememberMe: 1
            };
        
            const serverUrl = 'https://ttsapi03.bronci.com.tw/';
            const payload = {
                input: { text: text },
                voice: {model:"melotts", languageCode: 'cmn-TW', name: 'cmn-TW-vs2-F01' },
                audioConfig: { speakingRate: 1.1 },
                outputConfig:{streamMode:1,shortPauseDuration:150,longPauseDuration:300}
            };
        
            const response = await fetch(serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(credentials.username + ':' + credentials.password)
                },
                body: JSON.stringify(payload)
            });
        
            if (response.ok) {
                const audioData = await response.arrayBuffer();
                playAudio(audioData);
            } else {
                console.error('Failed to synthesize speech. HTTP response code:', response.status);
            }
        }
        
        function playAudio(audioData) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.decodeAudioData(audioData, buffer => {
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start(0);
            }, error => {
                console.error('Error decoding audio data:', error);
            });
        }
}

window.TTS = TTS;
