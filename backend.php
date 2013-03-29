<?php
$input = json_decode(file_get_contents("php://input"));
$start = $input->from;
$end = $input->to;

require "app/Dijkstra.php";
$graph = new Dijkstra;
foreach ($input->paths as $path) {
	$graph->addPath($path->from, $path->to, $path->distance);
}
$info = $graph->getShortestPathBetween($input->from, $input->to);
if ($start === $end) {
	$response =
		array(
			'message' => "Už jste tam."
		);
} elseif ($info['distance'] === PHP_INT_MAX) {
	$response = array(
		'message' => "Nejspíš neexistuje cesta."
	);
} else {
	$response = array(
		'message' => '"Nejkratší" cesta je za ' . $info['distance'] . ' bodů.',
		'graph'   => $info['graph']
	);
}

echo json_encode($response);