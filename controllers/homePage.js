
exports.getHomePage = (req, res) => {
    res.sendFile('homePage.html', { root: 'views' });
}

