const express = require('express');
const router  = express.Router();
const request = require('request');
const base64  = require('base-64');
const api_opts = {
  protocol: 'https:',
  port: 443,
  method: 'GET',
  hostname: 'api.github.com', 
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'Accept':     'application/vnd.github.v3+json',
    'Authorization': 'Basic '+base64.encode(cfg.username+':'+cfg.token)
  }
};

router.use(function request_time(req, res, next) {
  req.req_time = Date.now();
  next();
});

// route definition(s)
router.get('/:username', [
  fetch_repos,
  fetch_pr_count,
  display] );

// function definitions
function fetch_repos(req, res, next){
  console.log("[fetch_repos]", Date.now() - req.req_time);
  let this_opts = api_opts;
  this_opts.url = api_opts.protocol+'//'+api_opts.hostname+
    ['/users',req.params.username,'repos'].join('/');

  request(this_opts, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      req.params.repos = JSON.parse(body).map(repo => {
        return {
          name:      repo.name,
          html_url:  repo.html_url
        }; });
    } else { 
      console.error('err ('+ response.statusCode +'): ' + error); 
      req.params.repos = [];
    }
    next();
  });
}

function fetch_pr_count(req, res, next){
  console.log("[get_pr_count]",Date.now() - req.req_time);

  let remaining = req.params.repos.length;
  // avoid awkward pause for lack of repos
  if(!remaining) next();

  const repo_base_url = api_opts.protocol+'//'+
                        api_opts.hostname+'/repos/'+
                        req.params.username+'/';

  for (let i = req.params.repos.length - 1; i >= 0; i--) {
    let this_opts = api_opts;

    this_opts.url = repo_base_url+req.params.repos[i].name+"/pulls?state=open";

    request(this_opts, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        req.params.repos[i].prs = (JSON.parse(body)).length;
      } else {
        console.error("hit a snag ", Date.now() - req.req_time );
      }

      // next() conditional on all resolution
      remaining--;
      if(remaining===0){
        // sort by PRs desc
        req.params.repos.sort( (a,b) => { return b.prs - a.prs; });
        next();
      }
    });
  }

}

function display(req, res, next){
  console.log("[display] ", Date.now() - req.req_time);
  res.render('user',{
    title: 'PRHawk v1 - '+req.params.username+' open PRs', 
    repos: req.params.repos});

  // next();
}

module.exports = router