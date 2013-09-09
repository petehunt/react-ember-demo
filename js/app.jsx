/** @jsx React.DOM */
/*
			var router = Router({
				'/': this.setState.bind(this, {nowShowing: ALL_TODOS}),
				'/active': this.setState.bind(this, {nowShowing: ACTIVE_TODOS}),
				'/completed': this.setState.bind(this, {nowShowing: COMPLETED_TODOS})
			});
			router.init();
*/

var Navbar = React.createClass({
  render: function() {
    return (
      <div class="navbar">
        <div class="navbar-inner">
          <a class="brand" href="#">Bloggr</a>
          <ul class="nav">
            <li><a href="#/posts">Posts</a></li>
            <li><a href="#/about">About</a></li>
          </ul>
        </div>
      </div>
    );
  }
});

var App = React.createClass({
  render: function() {
    return (
      <div>
        <Navbar />
        <Posts posts={[]} />
      </div>
    );
  }
});

var Posts = React.createClass({
  render: function() {
    return (
      <div class="container-fluid">
        <div class="row-fluid">
          <div class="span3">
            <table class='table'>
              <thead>
                <tr><th>Recent Posts</th></tr>
              </thead>
              {{#each model}}
              <tr><td>
                  {{#link-to 'post' this}}{{title}} <small class='muted'>by {{author.name}}</small>{{/link-to}}
              </td></tr>
              {{/each}}
            </table>
          </div>
          <div class="span9">
            {{outlet}}
          </div>
        </div>
      </div>
    );
  }
});