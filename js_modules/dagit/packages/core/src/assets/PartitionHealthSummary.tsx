import {Spinner, Box, Colors, Caption} from '@sheenflow-io/ui';
import React from 'react';

import {displayNameForAssetKey} from '../asset-graph/Utils';
import {PartitionState, PartitionStatus} from '../partitions/PartitionStatus';

import {isTimeseriesDimension} from './MultipartitioningSupport';
import {AssetKey} from './types';
import {PartitionHealthData, PartitionHealthDimensionRange} from './usePartitionHealthData';

export const PartitionHealthSummary: React.FC<{
  assetKey: AssetKey;
  showAssetKey?: boolean;
  data: PartitionHealthData[];
  ranges?: PartitionHealthDimensionRange[];
}> = ({showAssetKey, assetKey, data, ranges}) => {
  const assetData = data.find((d) => JSON.stringify(d.assetKey) === JSON.stringify(assetKey));

  if (!assetData) {
    return (
      <div style={{minHeight: 55, position: 'relative'}}>
        <Spinner purpose="section" />
      </div>
    );
  }

  const keysForTotals = ranges
    ? ranges.map((r) => r.selected)
    : assetData.dimensions.map((d) => d.partitionKeys);

  const total = keysForTotals.reduce((total, d) => d.length * total, 1);

  const success = keysForTotals
    .reduce(
      (combinations, d) =>
        combinations.length
          ? combinations.flatMap((keys) => d.map((key) => [...keys, key]))
          : d.map((key) => [key]),
      [] as string[][],
    )
    .filter((dkeys) => assetData.stateForKey(dkeys) === PartitionState.SUCCESS).length;

  return (
    <Box color={Colors.Gray500}>
      <Box flex={{justifyContent: 'space-between'}} style={{fontWeight: 600}} margin={{bottom: 4}}>
        <Caption>{showAssetKey ? displayNameForAssetKey(assetKey) : 'Materialized'}</Caption>
        <Caption>{`${success.toLocaleString()}/${total.toLocaleString()}`}</Caption>
      </Box>
      {assetData.dimensions.map((dimension, dimensionIdx) => (
        <Box key={dimensionIdx} margin={{bottom: 4}}>
          {assetData.dimensions.length > 1 && <Caption>{dimension.name}</Caption>}
          <PartitionStatus
            small
            partitionNames={dimension.partitionKeys}
            splitPartitions={!isTimeseriesDimension(dimension)}
            selected={ranges ? ranges[dimensionIdx].selected : undefined}
            partitionStateForKey={(key) =>
              assetData.stateForSingleDimension(
                dimensionIdx,
                key,
                ranges?.length === 2 ? ranges[1 - dimensionIdx].selected : undefined,
              )
            }
          />
        </Box>
      ))}
    </Box>
  );
};
