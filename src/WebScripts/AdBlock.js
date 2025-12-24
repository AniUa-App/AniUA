// Адаптований AdBlock скрипт для React Native WebView
export const adBlockScript = `
(async function() {
    'use strict';
    
    try {
        // Створюємо UI для відображення статистики
        const createStatsUI = () => {
            const container = document.createElement('div');
            container.id = 'adblock-stats';
            container.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.85);
                color: text;
                padding: 15px 20px;
                border-radius: 12px;
                font-size: 16px;
                z-index: 999999;
                font-family: Arial, sans-serif;
                transition: all 0.3s;
                opacity: 0.9;
                min-width: 200px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                cursor: pointer;
            \`;

            // Створюємо детальну панель статистики
            const detailsPanel = document.createElement('div');
            detailsPanel.id = 'adblock-details';
            detailsPanel.style.cssText = \`
                position: fixed;
                top: 0;
                right: -50%;
                width: 50%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                color: text;
                padding: 20px;
                box-sizing: border-box;
                overflow-y: auto;
                transition: right 0.3s;
                z-index: 999998;
                font-family: Arial, sans-serif;
                box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
            \`;
            document.body.appendChild(detailsPanel);

            const stats = {
                blocked: 0,
                allowed: 0,
                blockedUrls: new Set(),
                allowedUrls: new Set()
            };

            const updateStats = () => {
                container.innerHTML = \`
                    <div style="margin-bottom: 10px; font-size: 18px; font-weight: bold;">AdBlock Статистика:</div>
                    <div style="color: #ff4444; margin: 8px 0; font-size: 16px;">🚫 Заблоковано: \${stats.blocked}</div>
                    <div style="color: #44ff44; margin: 8px 0; font-size: 16px;">✅ Пропущено: \${stats.allowed}</div>
                    <div style="font-size: 12px; margin-top: 10px; text-align: center;">Клікніть для деталей</div>
                \`;

                detailsPanel.innerHTML = \`
                    <div style="position: relative;">
                        <h2 style="margin: 0 0 20px 0; font-size: 24px;">Детальна статистика AdBlock</h2>
                        <button id="close-details" style="
                            position: absolute;
                            top: 0;
                            right: 0;
                            background: none;
                            border: none;
                            color: text;
                            font-size: 24px;
                            cursor: pointer;
                            padding: 5px;
                        ">×</button>
                        <div style="margin: 20px 0;">
                            <h3 style="color: #ff4444; margin: 10px 0;">Заблоковані URL (\${stats.blockedUrls.size}):</h3>
                            <div style="
                                background: rgba(255, 68, 68, 0.1);
                                border-radius: 8px;
                                padding: 10px;
                                margin: 10px 0;
                                max-height: 300px;
                                overflow-y: auto;
                            ">
                                \${Array.from(stats.blockedUrls).map(url => \`
                                    <div style="
                                        padding: 8px;
                                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                                        word-break: break-all;
                                        font-size: 14px;
                                    ">\${url}</div>
                                \`).join('')}
                            </div>
                            <h3 style="color: #44ff44; margin: 20px 0 10px;">Пропущені URL (\${stats.allowedUrls.size}):</h3>
                            <div style="
                                background: rgba(68, 255, 68, 0.1);
                                border-radius: 8px;
                                padding: 10px;
                                margin: 10px 0;
                                max-height: 300px;
                                overflow-y: auto;
                            ">
                                \${Array.from(stats.allowedUrls).map(url => \`
                                    <div style="
                                        padding: 8px;
                                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                                        word-break: break-all;
                                        font-size: 14px;
                                    ">\${url}</div>
                                \`).join('')}
                            </div>
                        </div>
                    </div>
                \`;

                // Обробник для кнопки закриття
                const closeButton = document.getElementById('close-details');
                if (closeButton) {
                    closeButton.onclick = () => {
                        detailsPanel.style.right = '-50%';
                    };
                }
            };

            // Показуємо детальну статистику при кліку
            container.onclick = () => {
                detailsPanel.style.right = '0';
            };

            document.body.appendChild(container);

            // Приховуємо статистику через 5 секунд
            setTimeout(() => {
                container.style.opacity = '0';
            }, 5000);

            // Показуємо при наведенні
            container.addEventListener('mouseenter', () => {
                container.style.opacity = '0.9';
            });

            // Приховуємо коли курсор покидає елемент
            container.addEventListener('mouseleave', () => {
                if (detailsPanel.style.right !== '0px') {
                    container.style.opacity = '0';
                }
            });

            return {
                incrementBlocked: (url) => {
                    stats.blocked++;
                    stats.blockedUrls.add(url);
                    updateStats();
                    container.style.opacity = '0.9';
                    setTimeout(() => {
                        if (detailsPanel.style.right !== '0px') {
                            container.style.opacity = '0';
                        }
                    }, 3000);
                },
                incrementAllowed: (url) => {
                    stats.allowed++;
                    stats.allowedUrls.add(url);
                    updateStats();
                }
            };
        };

        // Білий список доменів та шляхів, які НЕ треба блокувати
        const whitelist = [
            'uakino.js',
            'franecki.net',
            '/vod/',
        ];

        // Завантажуємо список блокування
        const response = await fetch('https://easylist.to/easylist/easylist.txt');
        if (!response.ok) {
            throw new Error('Не вдалося завантажити список блокування');
        }
        
        const text = await response.text();

        // Розбиваємо на рядки й очищаємо
        const lines = text
            .split('\\n')
            .map(line => line.trim())
            .filter(line =>
                line &&
                !line.startsWith('!') &&
                !line.startsWith('[') &&
                !line.includes('#')
            );

        // Використовуємо Set замість масивів для кращої продуктивності
        const domainRules = new Set();
        const fragmentRules = new Set();

        for (const line of lines) {
            // Виділяємо сам фільтр без опцій ($…)
            const raw = line.split('$')[0];

            if (raw.startsWith('||')) {
                // Доменне правило
                const domain = raw
                    .replace(/^\\|\\|/, '')
                    .replace(/\\^$/, '')
                    .trim();
                if (domain) domainRules.add(domain);
            } else {
                // Інші правила
                const fragment = raw.trim();
                if (fragment) fragmentRules.add(fragment);
            }
        }

        // Ініціалізуємо UI статистики
        const stats = createStatsUI();

        // Перевірка, чи потрібно блокувати URL
        const isBlocked = (url) => {
            try {
                // Перевірка білого списку
                for (const whitelistItem of whitelist) {
                    if (url.includes(whitelistItem)) {
                        stats.incrementAllowed(url);
                        return false;
                    }
                }

                const u = new URL(url);
                
                // Перевірка доменних правил
                for (const dom of domainRules) {
                    if (u.hostname === dom || u.hostname.endsWith('.' + dom)) {
                        // Додаткова перевірка на білий список для доменів
                        const fullUrl = u.href;
                        for (const whitelistItem of whitelist) {
                            if (fullUrl.includes(whitelistItem)) {
                                stats.incrementAllowed(url);
                                return false;
                            }
                        }
                        stats.incrementBlocked(url);
                        return true;
                    }
                }
                
                // Перевірка фрагментних правил
                for (const frag of fragmentRules) {
                    if (url.includes(frag)) {
                        // Додаткова перевірка на білий список для фрагментів
                        for (const whitelistItem of whitelist) {
                            if (url.includes(whitelistItem)) {
                                stats.incrementAllowed(url);
                                return false;
                            }
                        }
                        stats.incrementBlocked(url);
                        return true;
                    }
                }
                stats.incrementAllowed(url);
                return false;
            } catch (e) {
                console.warn('Помилка при перевірці URL:', e);
                return false;
            }
        };

        // Перехоплення XHR-запитів
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (isBlocked(url)) {
                console.log('Заблоковано XHR:', url);
                throw new Error('Заблоковано AdBlock');
            }
            return originalXHROpen.apply(this, arguments);
        };

        // Перехоплення Fetch API
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            if (isBlocked(url)) {
                console.log('Заблоковано fetch:', url);
                return Promise.reject(new Error('Заблоковано AdBlock'));
            }
            return originalFetch.apply(this, arguments);
        };

        // Спостерігач за додаванням <script> та <iframe>
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') {
                        const src = node.src || '';
                        if (src && isBlocked(src)) {
                            console.log('Заблоковано елемент:', src);
                            node.remove();
                        }
                    }
                }
            }
        });
        
        observer.observe(document.documentElement, { 
            childList: true, 
            subtree: true 
        });

        // Додаємо CSS для приховування рекламних елементів
        const style = document.createElement('style');
        style.textContent = \`
            [class*="ads"],
            [class*="banner"],
            [id*="ads"],
            [id*="banner"],
            iframe[src*="ads"],
            iframe[src*="banner"] {
                display: none !important;
            }
        \`;
        document.head.appendChild(style);

        console.log('AdBlock для WebView активовано успішно');
    } catch (error) {
        console.error('Помилка ініціалізації AdBlock:', error);
    }
})();
`;

// Скрипт для візуалізації всіх мережевих запитів
export const requestVisualizerScript = `
(function() {
    'use strict';

    const createVisualizer = () => {
        // Створюємо контейнер для візуалізації
        const container = document.createElement('div');
        container.id = 'request-visualizer';
        container.style.cssText = \`
            position: fixed;
            top: 0;
            right: -60%;
            width: 60%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            color: text;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
            transition: right 0.3s;
            z-index: 999997;
            font-family: Arial, sans-serif;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
        \`;

        // Створюємо кнопку для відкриття візуалізатора
        const button = document.createElement('div');
        button.id = 'request-visualizer-button';
        button.style.cssText = \`
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.85);
            color: text;
            padding: 15px 20px;
            border-radius: 12px;
            font-size: 16px;
            z-index: 999997;
            font-family: Arial, sans-serif;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.3s;
        \`;
        button.innerHTML = '🔍 Запити';

        // Масив для зберігання запитів
        const requests = [];
        let isOpen = false;

        const updateVisualizer = () => {
            container.innerHTML = \`
                <div style="position: relative;">
                    <h2 style="margin: 0 0 20px 0; font-size: 24px;">Мережеві запити</h2>
                    <button id="clear-requests" style="
                        position: absolute;
                        top: 0;
                        right: 40px;
                        background: none;
                        border: none;
                        color: text;
                        font-size: 16px;
                        cursor: pointer;
                        padding: 5px;
                    ">🗑️ Очистити</button>
                    <button id="close-visualizer" style="
                        position: absolute;
                        top: 0;
                        right: 0;
                        background: none;
                        border: none;
                        color: text;
                        font-size: 24px;
                        cursor: pointer;
                        padding: 5px;
                    ">×</button>
                    <div style="margin-top: 20px;">
                        <div style="
                            display: grid;
                            grid-template-columns: auto 100px 100px;
                            gap: 10px;
                            padding: 10px;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 8px;
                            margin-bottom: 10px;
                            font-weight: bold;
                        ">
                            <div>URL</div>
                            <div>Метод</div>
                            <div>Час</div>
                        </div>
                        \${requests.map(req => \`
                            <div style="
                                display: grid;
                                grid-template-columns: auto 100px 100px;
                                gap: 10px;
                                padding: 10px;
                                background: rgba(255, 255, 255, 0.05);
                                border-radius: 8px;
                                margin-bottom: 5px;
                                font-size: 14px;
                                word-break: break-all;
                            ">
                                <div>\${req.url}</div>
                                <div style="color: \${req.method === 'GET' ? '#44ff44' : '#ff9944'}">\${req.method}</div>
                                <div>\${req.time}</div>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;

            // Обробники подій
            const closeButton = document.getElementById('close-visualizer');
            const clearButton = document.getElementById('clear-requests');
            
            if (closeButton) {
                closeButton.onclick = () => {
                    container.style.right = '-60%';
                    isOpen = false;
                };
            }

            if (clearButton) {
                clearButton.onclick = () => {
                    requests.length = 0;
                    updateVisualizer();
                };
            }
        };

        // Додаємо елементи на сторінку
        document.body.appendChild(container);
        document.body.appendChild(button);

        // Обробник кліку по кнопці
        button.onclick = () => {
            if (!isOpen) {
                container.style.right = '0';
                isOpen = true;
            } else {
                container.style.right = '-60%';
                isOpen = false;
            }
        };

        // Перехоплення XHR запитів
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            const time = new Date().toLocaleTimeString();
            requests.unshift({ method, url, time });
            updateVisualizer();
            return originalXHROpen.apply(this, arguments);
        };

        // Перехоплення Fetch запитів
        const originalFetch = window.fetch;
        window.fetch = function(input, init = {}) {
            const method = init.method || 'GET';
            const url = typeof input === 'string' ? input : input.url;
            const time = new Date().toLocaleTimeString();
            requests.unshift({ method, url, time });
            updateVisualizer();
            return originalFetch.apply(this, arguments);
        };

        // Оновлюємо візуалізатор
        updateVisualizer();
    };

    // Ініціалізація після завантаження сторінки
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createVisualizer);
    } else {
        createVisualizer();
    }
})();
`;
