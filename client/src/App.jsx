import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import SearchBarWithSources from './components/SearchBarWithSources';
import Results from './components/Results';
import CssBaseline from '@material-ui/core/CssBaseline';

const styles = theme => ({
  root: {
    padding: `${5 * theme.spacing.unit}px 25%`,
    background: theme.palette.grey[100],
    height: '100%',
    minHeight: '100vh',
    [theme.breakpoints.down(767)]: {
    	padding: `${5 * theme.spacing.unit}px ${theme.spacing.unit}px`,
    }
  }
});

@withStyles(styles)
export default class App extends React.Component {

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
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <SearchBarWithSources selected={source} sources={[]} onSearch={this.onSearch} onSourceSelect={this.onSourceSelect} />
	    	{query ? <Results query={query} /> : null}
          </div>
        </React.Fragment>
      );
  	}
}