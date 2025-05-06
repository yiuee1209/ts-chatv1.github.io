class TTS {
        async synthesizeSpeech(text) {
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

            const res = await fetch(`${serverUrl}/api/v1/tts/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
                }),
             }).catch((error) => {
                throw new Error(`Unable to login: ${error}`);
             });

             const json = await res.json();
             if (json.error) {
               throw new Error(`Please check username and password`);
             }
             this.token = json.token;
                
            const response = await fetch(`${serverUrl}/api/v1/tts/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
                body: JSON.stringify(payload)
            });
        
            if (response.ok) {
                const audioData = await response.arrayBuffer();
                this.playAudio(audioData);
            } else {
                console.error('Failed to synthesize speech. HTTP response code:', response.status);
            }
        }
        

    async playAudio(audioData) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(audioData).catch(error => {
            console.error('Error decoding audio data:', error);
        });

        if (audioBuffer) {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
        }
    }
}


window.TTS = new TTS();
