import { RestApi } from '../RestApi'

export class DeathSequence {
    constructor() {
        this._injectStyles();
        this._buildDom();

        RestApi('Hit');

    }

    _injectStyles() {
        if (document.getElementById('death-sequence-styles')) return;

        const style = document.createElement('style');
        style.id = 'death-sequence-styles';
        style.textContent = `
            #death-overlay {
                position: fixed;
                inset: 0;
                z-index: 9999;
                pointer-events: none;
                opacity: 0;
                font-family: 'Courier New', monospace;
            }

            #death-flash {
                position: absolute;
                inset: 0;
                background: #ff0000;
                opacity: 0;
            }

            #death-shatter {
                position: absolute;
                inset: 0;
                overflow: hidden;
            }

            .shard {
                position: absolute;
                background: rgba(10, 0, 0, 0.92);
                border: 1px solid rgba(255, 60, 60, 0.4);
                transform-origin: center;
                opacity: 0;
            }

            #death-glitch {
                position: absolute;
                inset: 0;
                background: repeating-linear-gradient(
                    0deg,
                    rgba(255,0,60,0.08) 0px,
                    rgba(0,255,255,0.05) 2px,
                    transparent 4px,
                    transparent 6px
                );
                mix-blend-mode: screen;
                opacity: 0;
            }

            #death-screen {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #000;
                opacity: 0;
                pointer-events: none;
            }

            #death-screen.active {
                pointer-events: all;
            }

            #death-title {
                font-size: 64px;
                letter-spacing: 18px;
                color: #ff2b2b;
                text-shadow: 0 0 18px rgba(255,40,40,0.8), 0 0 40px rgba(255,0,0,0.4);
                margin-bottom: 28px;
                animation: death-flicker 2.4s infinite;
            }

            @keyframes death-flicker {
                0%, 89%, 92%, 100% { opacity: 1; }
                90%, 91% { opacity: 0.4; }
            }

            #death-subtitle {
                font-size: 14px;
                letter-spacing: 4px;
                color: rgba(255,255,255,0.5);
                margin-bottom: 36px;
                text-transform: uppercase;
            }

            #death-restart-btn {
                font-family: 'Courier New', monospace;
                font-size: 16px;
                letter-spacing: 3px;
                padding: 14px 36px;
                background: transparent;
                border: 1px solid rgba(255,60,60,0.6);
                color: #ff8888;
                cursor: pointer;
                text-transform: uppercase;
                transition: background 0.2s, color 0.2s;
            }

            #death-restart-btn:hover {
                background: rgba(255,40,40,0.15);
                color: #fff;
            }

            @keyframes shard-pop {
                from { opacity: 1; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    _buildDom() {
        const overlay = document.createElement('div');
        overlay.id = 'death-overlay';

        const flash = document.createElement('div');
        flash.id = 'death-flash';

        const shatter = document.createElement('div');
        shatter.id = 'death-shatter';

        const glitch = document.createElement('div');
        glitch.id = 'death-glitch';

        const screen = document.createElement('div');
        screen.id = 'death-screen';
        screen.innerHTML = `
            <div id="death-title">DEATH</div>
            <div id="death-subtitle">Ship integrity lost — surface impact</div>
            <button id="death-restart-btn">Restart</button>
        `;

        overlay.appendChild(flash);
        overlay.appendChild(shatter);
        overlay.appendChild(glitch);
        overlay.appendChild(screen);
        document.body.appendChild(overlay);

        this.overlay = overlay;
        this.flash = flash;
        this.shatter = shatter;
        this.glitch = glitch;
        this.screen = screen;
        this.restartBtn = screen.querySelector('#death-restart-btn');

        this.restartBtn.addEventListener('click', () => {
            window.location.reload();
        });

        this._buildShards();
    }

    _buildShards(count = 24) {
        this.shatter.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const shard = document.createElement('div');
            shard.className = 'shard';

            const w = 8 + Math.random() * 22;
            const h = 8 + Math.random() * 22;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const rot = (Math.random() - 0.5) * 60;

            shard.style.width = `${w}vw`;
            shard.style.height = `${h}vh`;
            shard.style.left = `${x}vw`;
            shard.style.top = `${y}vh`;
            shard.style.clipPath = this._randomPolygon();
            shard.dataset.rot = rot;
            shard.dataset.dx = (Math.random() - 0.5) * 40;
            shard.dataset.dy = (Math.random() - 0.5) * 40;

            this.shatter.appendChild(shard);
        }
    }

    _randomPolygon() {
        const points = [];
        const n = 5 + Math.floor(Math.random() * 2);
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * Math.PI * 2;
            const r = 35 + Math.random() * 20;
            const px = 50 + Math.cos(angle) * r;
            const py = 50 + Math.sin(angle) * r;
            points.push(`${px}% ${py}%`);
        }
        return `polygon(${points.join(', ')})`;
    }

    trigger() {
        document.exitPointerLock();
        this.overlay.style.opacity = '1';

        // 1) Vörös villanás
        this.flash.animate(
            [{ opacity: 0 }, { opacity: 0.85 }, { opacity: 0 }],
            { duration: 180, easing: 'ease-out' }
        );

        // 2) Glitch sávok villogása, párhuzamosan
        let glitchTicks = 0;
        const glitchInterval = setInterval(() => {
            this.glitch.style.opacity = Math.random() > 0.5 ? '1' : '0';
            this.glitch.style.transform = `translateX(${(Math.random() - 0.5) * 12}px)`;
            glitchTicks++;
            if (glitchTicks > 14) {
                clearInterval(glitchInterval);
                this.glitch.style.opacity = '0';
            }
        }, 45);

        // 3) Szilánkok szétrepülnek, kis késleltetéssel indítva
        setTimeout(() => {
            const shards = this.shatter.querySelectorAll('.shard');
            shards.forEach((shard, i) => {
                const dx = shard.dataset.dx;
                const dy = shard.dataset.dy;
                const rot = shard.dataset.rot;
                shard.animate(
                    [
                        { opacity: 0, transform: 'translate(0,0) rotate(0deg) scale(1)' },
                        { opacity: 1, transform: `translate(${dx}vw, ${dy}vh) rotate(${rot}deg) scale(1.02)`, offset: 0.3 },
                        { opacity: 1, transform: `translate(${dx * 1.4}vw, ${dy * 1.4}vh) rotate(${rot * 1.6}deg) scale(1)` },
                    ],
                    { duration: 650, delay: i * 8, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', fill: 'forwards' }
                );
            });
        }, 120);

        // 4) Végül a Halál-képernyő beúszik
        setTimeout(() => {
            this.screen.classList.add('active');
            this.screen.animate(
                [{ opacity: 0 }, { opacity: 1 }],
                { duration: 500, easing: 'ease-in', fill: 'forwards' }
            );
        }, 1000);
    }
}