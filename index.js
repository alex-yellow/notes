const express = require('express');
const exphbs = require('express-handlebars');
const cookieparser = require('cookie-parser');
const expsession = require('express-session');
const db = require('./db');

const app = express();
const PORT = 3000;

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

const secret = 'asd';
app.use(cookieparser(secret));
app.use(expsession({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 2000
    }
}));

app.get('/', function(req, res){
    const sqlSel = 'SELECT * FROM tasks';
    db.query(sqlSel, function(error, tasks, fields){
        if(error) throw error;
        res.render('notes', {title:'Notes', tasks, add:req.session.add, edit:req.session.edit, delete:req.session.delete, complete:req.session.complete});
    });
});

app.get('/add', function(req, res){
    res.render('add', {title:'Add task'});
});

app.post('/add', function(req, res){
    const title = req.body.title;
    const sqlAdd = 'INSERT INTO tasks (title) VALUES (?)';
    if(title != undefined && title != null){
        db.query(sqlAdd, [title], function(error, result, fields){
            if(error) throw error;
            req.session.add = `Task ${title} added success!`;
            res.redirect('/');
        });
    }
    else{
        res.render('error', {title:'Task is null', text:'Task is null'});
    }
    
});

app.get('/edit/:id', function(req, res){
    const id = req.params.id;
    const sqlFind = 'SELECT * FROM tasks WHERE id=?';
    db.query(sqlFind, [id], function(error, tasks, fields){
        if(error) throw error;
        const task = tasks[0];
        if(task){
            res.render('edit', {title:'Edit task', task});
        }
        else{
            res.render('error', {title:'Not task', text:'Task not found'});
        }
    });
});

app.post('/edit/:id', function(req, res){
    const id = req.params.id;
    const title = req.body.title;
    const sqlEdit = 'UPDATE tasks SET title=? WHERE id=?';
    if(title != undefined && title != null){
        db.query(sqlEdit, [title, id], function(error, result, fields){
            if(error) throw error;
            req.session.edit = `Task ${title} edit success!`;
            res.redirect('/');
        });
    }
    else{
        res.render('error', {title:'Task is null', text:'Task is null'});
    }
});

app.get('/delete/:id', function(req, res){
    const id = req.params.id;
    const sqlFind = 'SELECT * FROM tasks WHERE id=?';
    db.query(sqlFind, [id], function(error, tasks, fields){
        if(error) throw error;
        const task = tasks[0];
        if(task){
            const sqlDel = 'DELETE FROM tasks WHERE id=?';
            db.query(sqlDel, [id], function(error, result, fields){
                if(error) throw error;
                req.session.delete = `Task ${task.title} delete success!`;
                res.redirect('/');
            });
        }
        else{
            res.render('error', {title:'Not task', text:'Task not found'});
        }
    });
});

app.get('/complete/:id', function(req, res){
    const id = req.params.id;
    const sqlFind = 'SELECT * FROM tasks WHERE id=?';
    db.query(sqlFind, [id], function(error, tasks, fields){
        if(error) throw error;
        const task = tasks[0];
        const newCompleted = !task.completed;
        if(task){
            const sqlCom = 'UPDATE tasks SET completed=? WHERE id=?';
            db.query(sqlCom, [newCompleted, id], function(error, result, fields){
                if(error) throw error;
                req.session.complete = `Task ${task.title} complete updated success!`;
                res.redirect('/');
            });
        }
        else{
            res.render('error', {title:'Not task', text:'Task not found'});
        }
    });
});

app.use(function(req, res){
    res.render('error', {title:'Not found', text:'Not found'});
});

app.listen(PORT, function(){
    console.log('Server is rinning on port: ' + PORT);
});