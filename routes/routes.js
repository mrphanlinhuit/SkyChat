module.exports = function(app){
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    
    app.route('/')
        .app.get('/', function(req, res, next){
            res.render('index');//load the index.ejs file
        });
    
    app.route('/chat')
        .app.get('/chat', function(req, res, next){
            res.render('chat');
        });
};