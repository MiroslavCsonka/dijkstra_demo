<?php

interface GraphAble {
	public function addPath ($from, $to, $distance);

	public function removePath ($from, $to);

	public function getNearest();
}