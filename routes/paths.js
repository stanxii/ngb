
/*
 * GET home page.
 */

exports.nesting= function(req, res){
  res.render('test/nesting', { title: 'Nesting' });
};

exports.stan= function(req, res){
  res.render('test/stan', { title: 'Stan Hello Node!' });
};
