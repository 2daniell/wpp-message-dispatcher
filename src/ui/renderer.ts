document.addEventListener("DOMContentLoaded", async () => {

    let currentReqId = null;
    let pendingBotName = null;

    function openModal(id) {
        document.getElementById(id).style.display = 'flex';
    }
      
    function closeModal(id) {
        document.getElementById(id).style.display = 'none';
    }
    
    function close() {
        if (window.botAPI && window.botAPI.closeApp) {
            window.botAPI.closeApp();
        } else {
            alert("Função de fechar não conectada ainda.");
        }
    }
    
    async function renderBots() {
        const grid = document.querySelector('.grid');
        if (!grid) return;
      
        grid.innerHTML = '';
      
        const bots = await window.botAPI.listBots();
      
        bots.forEach(bot => {
          const card = document.createElement('div');
          card.classList.add('card');
          card.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path d="M9 18h6M9 6h6M4.5 12h15M9 6v12M15 6v12" />
            </svg>
            <div>${bot.name}</div>
            <div style="color: #007bff;">${bot.status}</div>
          `;
          grid.appendChild(card);
        });

        const addCard = document.createElement('div');
        addCard.classList.add('card', 'add');
        addCard.textContent = '+';
        grid.appendChild(addCard);

        addCard.addEventListener('click', () => {
            console.log('APA');
            openModal('modal-add');
          });
      }

  
    function renderQRCodeToCanvas(qrData, canvasId = 'qrCanvas') {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement
        const ctx = canvas.getContext('2d')

        const qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qrData)

        const img = new Image()
            img.crossOrigin = 'Anonymous'
            img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        img.onerror = function () {
            console.error('Falha ao carregar imagem do QR')
        }
        img.src = qrImageUrl
    }
    
    async function createBot() {
    
        const name = (document.getElementById('input-instancia') as HTMLInputElement).value.trim();
        if (!name) return;
    
        pendingBotName = name;
        currentReqId = crypto.randomUUID(); 
    
        await window.botAPI.createBot(name, currentReqId);
    
        window.botAPI.onBotEvent(currentReqId, async (data) => {
            if (data.type === 'qr') {
                renderQRCodeToCanvas(data.qr, "qr-canvas")
                openModal('modal-qr');
                closeModal('modal-add')
            }
        
            if (data.type === 'ready') {
                
                renderBots();

                closeModal('modal-qr');

                pendingBotName = null;
                currentReqId = null;
            }
          });
    
    
    }

    renderBots();

    window.botAPI.onStatusUpdate?.((data) => {
        console.log("LALALALA")
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
          const nameEl = card.querySelector('div:nth-child(2)');
          const statusEl = card.querySelector('div:nth-child(3)');
          if (nameEl?.textContent === data.botName) {
            statusEl.textContent = data.status;
          }
        });
    });

    document.querySelector("#modal-add button").addEventListener("click", () => {
        createBot()
    });

    document.querySelector(".close-app").addEventListener("click", () => {
        close()
    });
        
    document.querySelectorAll('.modal .close').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (index === 0) closeModal('modal-add');
            if (index === 1) closeModal('modal-qr');
        });
    });
})
  