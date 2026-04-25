/**
 * CropSmart Authentication Module
 */

const AuthManager = {
    // Demo Account
    DEMO_USER: {
        email: "demo@cropsmart.com",
        password: "Demo@1234",
        name: "Demo Farmer"
    },

    init() {
        // Pre-seed demo account if it doesn't exist
        const users = this.getUsers();
        const demoExists = users.some(u => u.identifier === this.DEMO_USER.email);
        if (!demoExists) {
            this.signUp(this.DEMO_USER.name, this.DEMO_USER.email, this.DEMO_USER.password);
        }
    },

    getUsers() {
        return JSON.parse(localStorage.getItem('cropsmart_users') || '[]');
    },

    signUp(name, identifier, password) {
        const users = this.getUsers();
        if (users.some(u => u.identifier === identifier)) {
            return { success: false, message: "User already exists" };
        }

        const newUser = { name, identifier, password };
        users.push(newUser);
        localStorage.setItem('cropsmart_users', JSON.stringify(users));
        return { success: true, message: "Account created successfully!" };
    },

    signIn(identifier, password) {
        const users = this.getUsers();
        const user = users.find(u => u.identifier === identifier && u.password === password);

        if (user) {
            const session = {
                name: user.name,
                identifier: user.identifier,
                loggedIn: true,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('cropsmart_session', JSON.stringify(session));
            return { success: true, user };
        }

        return { success: false, message: "Invalid credentials. Please try again." };
    },

    signOut() {
        localStorage.removeItem('cropsmart_session');
        window.location.href = 'index.html';
    },

    getSession() {
        const session = localStorage.getItem('cropsmart_session');
        return session ? JSON.parse(session) : null;
    },

    isLoggedIn() {
        const session = this.getSession();
        return session && session.loggedIn;
    },

    guard() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
        }
    }
};

// Initialize Auth
AuthManager.init();
