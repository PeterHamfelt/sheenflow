# pylint: disable=redefined-outer-name
from sheenflow import asset


# start_marker
@asset
def upstream_asset():
    return [1, 2, 3]


@asset
def downstream_asset(upstream_asset):
    return upstream_asset + [4]


# end_marker
