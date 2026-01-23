// Student AI Hub — Home Page Render Script

(function() {
    'use strict';

    // Load content data
    function loadJSON(elementId, callback) {
        const script = document.getElementById(elementId);
        if (!script) {
            console.warn('Content data element not found:', elementId);
            callback(null);
            return;
        }

        try {
            const data = JSON.parse(script.textContent);
            callback(data);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            callback(null);
        }
    }

    // Render section cards
    function renderSectionCard(section, links, showTag) {
        const linkUrl = links && links[section.linkKey] ? links[section.linkKey] : '#';
        const tagHtml = showTag ? '<span class="human-maintained-tag">Human-maintained</span>' : '';
        
        return `
            <div class="section-card">
                ${tagHtml}
                <h3>${escapeHTML(section.title)}</h3>
                <p>${escapeHTML(section.description)}</p>
                ${linkUrl !== '#' ? `<a href="${escapeHTML(linkUrl)}">Read more</a>` : ''}
            </div>
        `;
    }

    // Render primary sections
    function renderPrimarySections(sections, links) {
        const grid = document.getElementById('primary-section-grid');
        const title = document.getElementById('primary-sections-title');
        
        if (title && sections && sections.title) {
            title.textContent = sections.title;
        }
        
        if (!grid || !sections || !Array.isArray(sections.sections)) {
            return;
        }

        grid.innerHTML = sections.sections.map(section => {
            return renderSectionCard(section, links, false);
        }).join('');
    }

    // Render human-maintained sections
    function renderHumanMaintained(data, links) {
        const grid = document.getElementById('human-maintained-grid');
        const title = document.getElementById('human-maintained-title');
        const note = document.getElementById('human-maintained-note');
        
        if (title && data && data.title) {
            title.textContent = data.title;
        }
        
        if (note && data && data.note) {
            note.textContent = data.note;
        }
        
        if (!grid || !data || !Array.isArray(data.sections)) {
            return;
        }

        grid.innerHTML = data.sections.map(section => {
            return renderSectionCard(section, links, true);
        }).join('');
    }

    // Render transparency tiles
    function renderTransparency(data, links) {
        const grid = document.getElementById('transparency-grid');
        const title = document.getElementById('transparency-title');
        
        if (title && data && data.title) {
            title.textContent = data.title;
        }
        
        if (!grid || !data || !Array.isArray(data.tiles)) {
            return;
        }

        grid.innerHTML = data.tiles.map(tile => {
            return renderSectionCard(tile, links, false);
        }).join('');
    }

    // Update text elements
    function updateTextElement(id, text) {
        const element = document.getElementById(id);
        if (element && text) {
            element.textContent = text;
        }
    }

    // Escape HTML to prevent XSS
    function escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when DOM is ready
    function init() {
        let contentData = null;
        let linksData = null;

        // Load content data
        loadJSON('content-data', function(data) {
            contentData = data;
            if (data) {
                updateTextElement('subtitle', data.subtitle);
                updateTextElement('intro-text', data.intro);
                updateTextElement('footer-text', data.footer);
                
                if (linksData) {
                    renderAll(contentData, linksData);
                }
            }
        });

        // Load links data
        loadJSON('links-data', function(data) {
            linksData = data;
            if (contentData) {
                renderAll(contentData, linksData);
            }
        });

        function renderAll(content, links) {
            if (content.primarySections) {
                renderPrimarySections(content.primarySections, links);
            }
            if (content.humanMaintained) {
                renderHumanMaintained(content.humanMaintained, links);
            }
            if (content.transparency) {
                renderTransparency(content.transparency, links);
            }
        }
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
