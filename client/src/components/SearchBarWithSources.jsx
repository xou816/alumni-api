import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '../environment';
import SearchBar from './SearchBar';
import WarningMessage from './WarningMessage';
import AddSourceDialog from './AddSourceDialog';
import Fade from '@material-ui/core/Fade';

const styles = theme => ({
  center: {
    textAlign: 'center'
  },
  button: {
    color: theme.palette.primary.contrastText
  }
});

@withStyles(styles)
export default class SearchBarWithSources extends React.Component {

  render() {
      let {classes, query, onSearch, onSourceSelect, selected} = this.props;
      return (
        <QueryRenderer 
          environment={environment}
          query={graphql`
            query SearchBarWithSourcesQuery {
              source {
                id
                key
                enabled
              }
            }
            `}
          variables={query}
          render={({error, props}) => (
            <React.Fragment>
              <SearchBar 
                sources={props && props.source ? props.source : []}
                selected={selected}
                onSourceSelect={onSourceSelect} 
                onSearch={query => {
                  if (props && props.source) {
                    onSearch({...query, source: props.source[selected].key })                  
                  }
                }} />
              {
                props && props.source && !props.source[selected].enabled ?
                  (<Fade in>
                    <WarningMessage>
                      Source is not configured! <AddSourceDialog source={props.source[selected].key} ButtonProps={{className: classes.button}} />
                    </WarningMessage>
                  </Fade>) :
                  null
              }
            </React.Fragment>
            )} />
      );
    }
}