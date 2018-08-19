import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import WarningIcon from '@material-ui/icons/Warning';
import SearchField from './SearchField';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Badge from '@material-ui/core/Badge';
import pretty from '../sources';
import { Link } from 'react-router-dom'

const styles = theme => ({
  tabs: {
    marginBottom: theme.spacing.unit * 2
  },
  search: {
    ...theme.mixins.gutters(),
    paddingBottom: 0,
    marginBottom: theme.spacing.unit * 10,
    background: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
  text: {
  	color: theme.palette.primary.contrastText,
  	paddingBottom: theme.spacing.unit
  },
  buttonContainer: {
  	textAlign: 'center',
  	position: 'relative',
  	bottom: theme.spacing.unit * -3
  },
  badge: {
    padding: `0 ${theme.spacing.unit}px`
  }
});

@withStyles(styles)
export default class SearchBar extends React.Component {

	state = {
		query: {}
	}

  onClick = event => this.props.onSearch(this.state.query)

	onSearchChanged = search => {
		let newQuery = search.reduce((acc, {name, value}) => ({
			...acc, 
			[name]: value
		}), {})
		this.setState({query: newQuery})
	}

	render() {
		let {classes, sources, selected, onSourceSelect} = this.props;
		let {query} = this.state;
  	return (
    	<Paper className={classes.search} elevation={0}>
        <Tabs classes={{root: classes.tabs}} 
              onChange={(e, v) => onSourceSelect(v)} 
              value={selected} 
              scrollable
              scrollButtons="auto"
              TabIndicatorProps={{style: {top: 0, height: '5px'}}}>
          {sources.map(source => (
            <Tab key={source.key} label={
              source.enabled ?
              pretty[source.key] :
              <Badge className={classes.badge} badgeContent="!" color="secondary">{pretty[source.key]}</Badge>
            } />
          ))}
        </Tabs>
    		<SearchField onSearchChanged={this.onSearchChanged} />
    		<div className={classes.buttonContainer}>
	    		<Button component={Link} to="/" onClick={this.onClick} color="secondary" variant="extendedFab">
	        	<SearchIcon /> Search
	      	</Button>
      	</div>
    	</Paper>
    );
	}
}