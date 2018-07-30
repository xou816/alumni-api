import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import SearchBar from './components/SearchBar';
import Results from './components/Results';
import CssBaseline from '@material-ui/core/CssBaseline';

const styles = theme => ({
  root: {
    padding: `${5 * theme.spacing.unit}px 25%`,
    background: theme.palette.grey[100],
    height: '100%',
    minHeight: '100vh'
  }
});

@withStyles(styles)
export default class App extends React.Component {

	state = {
		query: {}
	}

  onSearch = query => this.setState({query})

 	render() {
  		let {classes} = this.props;
  		let {query} = this.state;
    	return (
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <SearchBar onSearch={this.onSearch} />
	    	    <Results query={query} />
          </div>
        </React.Fragment>
      );
  	}
}