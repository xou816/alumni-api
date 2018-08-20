import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import SearchBarWithSources from './components/SearchBarWithSources';
import Results from './components/Results';
import CssBaseline from '@material-ui/core/CssBaseline';
import { HashRouter as Router, Route } from "react-router-dom";
import Profile from "./components/Profile";
import { LoginDialog } from './components/AddSourceDialog';

const styles = theme => ({
  root: {
    padding: `${3 * theme.spacing.unit}px 25%`,
    background: theme.palette.grey[100],
    height: '100%',
    minHeight: '100vh',
    [theme.breakpoints.down(767)]: {
    	padding: `${1 * theme.spacing.unit}px ${theme.spacing.unit}px`,
    }
  }
});

@withStyles(styles)
export default class extends React.Component {

	state = {
		query: null,
		source: 0,
    user: null
	}

  constructor() {
    super();
    let user = localStorage.getItem('user');
    if (user) {
      this.state = {...this.state, user};
    }
  }

  onSearch = query => this.setState({query})

  onSourceSelect = source => this.setState({source})

  onOk = (u, p) => {
    let user = btoa(`${u}:${p}`);
    localStorage.setItem('user', user);
    this.setState({user});
  }

 	render() {
		let {classes} = this.props;
		let {query, source, user} = this.state;
  	return (
      <Router>
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            {
              user === null ? <LoginDialog 
                title="Login"
                text="Please login to use this tool. If this is your first time using it, just pick a username and a password!" 
                handleOk={this.onOk}
                open /> : <SearchBarWithSources 
                selected={source} 
                sources={[]} 
                onSearch={this.onSearch} 
                onSourceSelect={this.onSourceSelect} />
            }
            <Route path="/" exact render={() => query && user ? <Results query={query} /> : null} />
            <Route path="/:id" component={({match}) => <Profile id={match.params.id} />} />
          </div>
          
        </React.Fragment>
      </Router>
      );
  	}
}