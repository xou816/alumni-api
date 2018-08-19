import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import SearchBarWithSources from './components/SearchBarWithSources';
import Results from './components/Results';
import CssBaseline from '@material-ui/core/CssBaseline';
import { HashRouter as Router, Route } from "react-router-dom";
import Profile from "./components/Profile";

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
		source: 0
	}

  onSearch = query => this.setState({query})

  onSourceSelect = source => this.setState({source})

 	render() {
		let {classes} = this.props;
		let {query, source} = this.state;
  	return (
      <Router>
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <SearchBarWithSources selected={source} sources={[]} onSearch={this.onSearch} onSourceSelect={this.onSourceSelect} />
            <Route path="/" exact render={() => query ? <Results query={query} /> : null} />
            <Route path="/:id" component={({match}) => <Profile id={match.params.id} />} />
          </div>
        </React.Fragment>
      </Router>
      );
  	}
}