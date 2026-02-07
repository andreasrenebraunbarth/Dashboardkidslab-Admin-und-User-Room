const ideasList = document.getElementById('ideasList');
const submitIdeaBtn = document.getElementById('submitIdea');
const ideaInput = document.getElementById('ideaInput');

// Load ideas from localStorage on startup
let ideas = JSON.parse(localStorage.getItem('ideas')) || [];

function renderIdeas() {
    ideasList.innerHTML = '';

    // Sort ideas newer first
    const sortedIdeas = [...ideas].reverse();

    if (sortedIdeas.length === 0) {
        ideasList.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
                Noch keine Ideen vorhanden. Sei der Erste!
            </div>
        `;
        return;
    }

    sortedIdeas.forEach(idea => {
        const card = document.createElement('div');
        card.className = 'idea-card';
        // Add random slight delay for animation if we wanted to

        const isMyIdea = idea.author === localStorage.getItem('currentUser');
        const deleteButton = isMyIdea ? `
            <button class="delete-btn" onclick="deleteIdea(${idea.id})" title="Löschen">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        ` : '';

        card.innerHTML = `
            <div class="idea-header">
                <span class="idea-author">${idea.author}</span>
                <span class="idea-date">${new Date(idea.timestamp).toLocaleDateString()}</span>
            </div>
            <p class="idea-content">${idea.content}</p>
            ${deleteButton}
        `;
        ideasList.appendChild(card);
    });
}

function addIdea() {
    const content = ideaInput.value.trim();
    if (!content) return;

    const newIdea = {
        id: Date.now(),
        content: content,
        author: localStorage.getItem('currentUser') || 'Anonym',
        timestamp: Date.now()
    };

    ideas.push(newIdea);
    localStorage.setItem('ideas', JSON.stringify(ideas));

    ideaInput.value = '';
    renderIdeas();
}

window.deleteIdea = function (id) {
    if (confirm('Möchtest du diese Idee wirklich löschen?')) {
        ideas = ideas.filter(idea => idea.id !== id);
        localStorage.setItem('ideas', JSON.stringify(ideas));
        renderIdeas();
    }
};

// Event Listeners
submitIdeaBtn.addEventListener('click', addIdea);

ideaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addIdea();
    }
});

// Update user avatar logic
const userAvatar = document.getElementById('userAvatar');
if (userAvatar) {
    const user = localStorage.getItem('currentUser');
    if (user) {
        userAvatar.textContent = user.charAt(0).toUpperCase();
    }
}

// Initial render
renderIdeas();
