<?php
/**
 * Created by JetBrains PhpStorm.
 * User: forex
 * Date: 3/28/13
 * Time: 2:38 AM
 * To change this template use File | Settings | File Templates.
 */

class Dijkstra {
	/** @var array Přehled cest které, se kterými můžeme počítat (zadání grafu) */
	private $paths;

	/** @var array Dočasné cesty v grafu o kterých si nejsme jisti zda jsou ideální */
	private $temp = array();

	/** @var array Permanentní cesty v grafu o kterých jsme si jisti, že jsou ideální */
	private $pernament = array();

	/**
	 * Přidá cestu do grafu
	 * @param string $from        Odkud
	 * @param string $to          Kam
	 * @param int    $distance    Za kolik
	 */
	public function addPath ($from, $to, $distance) {
		$this->paths[(string) $from][(string) $to] = intval($distance);
	}

	public function getShortestPathBetween ($start, $end) {
		$end = (string) $end;
		$actualIndexingNode = (string) $start;
		$actualDistance = 0;
		$distanceToEnd = PHP_INT_MAX;
		do {
			$this->indexPathsToTemp($actualIndexingNode, $actualDistance); // Zaindexujeme kam se umíme dostat
			if (empty( $this->temp )) {
				break;
			}
			$nearestNode = $this->moveToPermanent(); // Nejmenší prvek z tempu přesuneme do permanentního
			$actualIndexingNode = $nearestNode['to'];
			$actualDistance = $nearestNode['distance'];
			if ($actualIndexingNode == $end) {
				if ($actualDistance < $distanceToEnd) {
					$distanceToEnd = $actualDistance;
				} else { // Pokud už aktuální indexovaná vzdálenost, je větší než cesta do cíle, nemusím dál hledat
					break;
				}
			}
		} while (true);
		$through = array();
		$actualBackTract = $end;
		while ($actualBackTract !== $start) {
			$through[] = $actualBackTract = $this->getPrevious($actualBackTract);
		}
		$through = array_reverse($through);
		return array(
			'through'  => $through,
			'distance' => $distanceToEnd
		);
	}

	/**
	 * Zaindexuje určité cesty (podle počátečního Nodu $from) ze zadání do dočasného pole
	 * @param string $from
	 * @param int    $plusDistance
	 */
	private function indexPathsToTemp ($from, $plusDistance) {
		if (isset( $this->paths[$from] )) {
			foreach ($this->paths[$from] as $nodeTo => $distance) {
				$this->addEdge($this->temp, $from, $nodeTo, $distance + $plusDistance);
			}
		}
	}

	/**
	 * Přesune nejmenší (do) cestu z dočasného pole do permanentního
	 * @return array
	 */
	private function moveToPermanent () {
		$nearestNode = $this->getLowestFromTemp(); // Get from temp nearest node
		unset( $this->temp[$nearestNode['from']][$nearestNode['to']] );
		if (count($this->temp[$nearestNode['from']]) == 0) {
			unset( $this->temp[$nearestNode['from']] );
		}
		$this->addEdge($this->pernament, $nearestNode['from'], $nearestNode['to'], $nearestNode['distance']); // Insert it to permanent array
		return $nearestNode;
	}

	/**
	 * Získá nejmenší prvek z dočasného pole
	 * @return array
	 */
	private function getLowestFromTemp () {
		$edge['distance'] = PHP_INT_MAX;
		foreach ($this->temp as $nodeFrom => $paths) {
			foreach ($paths as $nodeTo => $distance) {
				if ($distance < $edge['distance']) {
					$edge = array( 'from' => $nodeFrom, 'to' => $nodeTo, 'distance' => $distance );
				}
			}
		}
		return $edge;
	}

	/**
	 * Přidá cestu do bufferu
	 * @param array  $array
	 * @param string $from
	 * @param string $to
	 * @param int    $distance
	 */
	private function addEdge (&$array, $from, $to, $distance) {
		if (isset( $array[$from][$to] ) && $array[$from][$to] <= $distance) { // Pokud již máme hodnotu a je menší nic neděláme
			return;
		}
		$array[$from][$to] = $distance;
	}

	/**
	 * Získá předchozí destinaci
	 * @param string $end
	 */
	public function getPrevious ($end) {
		$possible = array();
		foreach ($this->pernament as $from => $info) {
			if (isset( $info[$end] )) {
				$possible[$from] = $info[$end];
			}
		}
		$lowest['distance'] = PHP_INT_MAX;
		foreach ($possible as $node => $distance) {
			if ($distance < $lowest['distance']) {
				$lowest['node'] = $node;
				$lowest['distance'] = $distance;
			}
		}
		return $lowest['node'];
	}

}