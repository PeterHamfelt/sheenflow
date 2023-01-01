import time

import pytest
from sheenflow_mysql.run_storage import MySQLRunStorage
from sqlalchemy import exc


def retry_connect(conn_string: str, num_retries: int = 5, pool_recycle=-1):
    storage = MySQLRunStorage.create_clean_storage(conn_string)
    storage.optimize_for_dagit(-1, pool_recycle=pool_recycle)

    with storage.connect() as conn:
        conn.execute("SET SESSION wait_timeout = 2;")

    for _ in range(num_retries):
        time.sleep(3)
        with storage.connect() as conn:
            conn.execute("SELECT 1;")

    return storage.get_runs()


def test_pool_recycle_greater_than_wait_timeout(conn_string):
    with pytest.raises(exc.OperationalError):
        retry_connect(conn_string)


def test_pool_recycle_less_than_wait_timeout(conn_string):
    runs_lst = retry_connect(conn_string, pool_recycle=1)
    assert len(runs_lst) == 0
